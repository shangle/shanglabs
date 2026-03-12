/**
 * NACHA File Parser for CCD (Corporate Credit/Debit) files
 * 100% client-side - files never leave the browser
 */

class NACHAParser {
  constructor() {
    this.parsedData = null;
    this.recordTypes = {
      '1': 'File Header',
      '5': 'Batch Header',
      '6': 'Entry Detail',
      '7': 'Addenda',
      '8': 'Batch Control',
      '9': 'File Control'
    };
    // Supported Standard Entry Class codes
    this.supportedSECs = ['CCD', 'PPD'];
  }

  /**
   * Parse a NACHA file content
   * @param {string} content - The raw file content
   * @returns {Object} Parsed data structure
   */
  parse(content) {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length === 94);

    if (lines.length === 0) {
      throw new Error('No valid NACHA records found. Records must be exactly 94 characters.');
    }

    // Check file type from first batch header
    const firstLine = lines[0];
    let detectedSEC = null;
    
    // Find first batch header to determine SEC
    for (const line of lines) {
      if (line.substring(0, 1) === '5') {
        detectedSEC = line.substring(50, 53);
        break;
      }
    }

    if (detectedSEC && !this.supportedSECs.includes(detectedSEC)) {
      throw new Error(`Unsupported file type: ${detectedSEC}. This viewer supports CCD (Corporate Credit/Debit) and PPD (Prearranged Payment and Deposit) files.`);
    }

    this.parsedData = {
      fileHeader: null,
      batches: [],
      fileControl: null,
      rawRecords: lines,
      totalRecords: lines.length,
      warnings: []
    };

    let currentBatch = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const recordType = line.substring(0, 1);

      switch (recordType) {
        case '1':
          this.parsedData.fileHeader = this.parseFileHeader(line);
          break;

        case '5':
          currentBatch = this.parseBatchHeader(line);
          this.parsedData.batches.push(currentBatch);
          break;

        case '6':
          if (!currentBatch) {
            throw new Error(`Entry Detail record at line ${i + 1} found without a Batch Header.`);
          }
          currentBatch.entries.push(this.parseEntryDetail(line));
          break;

        case '7':
          // Addenda records - link to last entry
          if (currentBatch && currentBatch.entries.length > 0) {
            const lastEntry = currentBatch.entries[currentBatch.entries.length - 1];
            if (!lastEntry.addenda) {
              lastEntry.addenda = [];
            }
            lastEntry.addenda.push(this.parseAddenda(line));
          }
          break;

        case '8':
          if (currentBatch) {
            currentBatch.batchControl = this.parseBatchControl(line);
          }
          break;

        case '9':
          this.parsedData.fileControl = this.parseFileControl(line);
          break;

        default:
          this.parsedData.warnings.push(`Unknown record type '${recordType}' at line ${i + 1}`);
      }
    }

    return this.parsedData;
  }

  /**
   * Parse File Header record (record type 1)
   */
  parseFileHeader(line) {
    return {
      recordType: '1',
      priorityCode: line.substring(1, 3),
      immediateDestination: line.substring(3, 13),
      immediateOrigin: line.substring(13, 23),
      fileCreationDate: line.substring(23, 29),
      fileCreationTime: line.substring(29, 33),
      fileIdModifier: line.substring(33, 34),
      recordSize: line.substring(34, 37),
      blockingFactor: line.substring(37, 39),
      formatCode: line.substring(39, 40),
      immediateDestinationName: line.substring(40, 63),
      immediateOriginName: line.substring(63, 86),
      referenceCode: line.substring(86, 94)
    };
  }

  /**
   * Parse Batch Header record (record type 5)
   */
  parseBatchHeader(line) {
    return {
      recordType: '5',
      serviceClassCode: line.substring(1, 4),
      companyName: line.substring(4, 20),
      companyIdentification: line.substring(20, 40),
      standardEntryClassCode: line.substring(50, 53),
      companyEntryDescription: line.substring(53, 63),
      companyDescriptiveDate: line.substring(63, 69),
      effectiveEntryDate: line.substring(69, 75),
      settlementDate: line.substring(75, 78),
      originatorStatusCode: line.substring(78, 79),
      odfiIdentification: line.substring(79, 87),
      batchNumber: line.substring(87, 94),
      entries: [],
      batchControl: null
    };
  }

  /**
   * Parse Entry Detail record (record type 6)
   */
  parseEntryDetail(line) {
    const transactionCode = line.substring(1, 3);
    const amount = parseFloat(line.substring(79, 87)) / 100;

    return {
      recordType: '6',
      transactionCode,
      transactionCodeDescription: this.getTransactionCodeDescription(transactionCode),
      receivingDFIIdentification: line.substring(3, 11),
      checkDigit: line.substring(11, 12),
      receivingDFIAccountNumber: line.substring(12, 29),
      amount,
      individualIdentificationNumber: line.substring(39, 54),
      individualName: line.substring(54, 76),
      discretionaryData: line.substring(76, 78),
      addendaRecordIndicator: line.substring(78, 79),
      traceNumber: line.substring(79, 94),
      addenda: null
    };
  }

  /**
   * Parse Addenda record (record type 7)
   */
  parseAddenda(line) {
    return {
      recordType: '7',
      addendaTypeCode: line.substring(1, 3),
      paymentRelatedInformation: line.substring(3, 83),
      addendaSequenceNumber: line.substring(83, 87),
      entryDetailSequenceNumber: line.substring(87, 94)
    };
  }

  /**
   * Parse Batch Control record (record type 8)
   */
  parseBatchControl(line) {
    return {
      recordType: '8',
      serviceClassCode: line.substring(1, 4),
      entryAndAddendaCount: parseInt(line.substring(4, 10)),
      entryHash: line.substring(10, 20),
      totalDebitEntryAmount: parseFloat(line.substring(20, 32)) / 100,
      totalCreditEntryAmount: parseFloat(line.substring(32, 44)) / 100,
      companyIdentification: line.substring(44, 64),
      messageAuthenticationCode: line.substring(64, 73),
      reserved: line.substring(73, 79),
      odfiIdentification: line.substring(79, 87),
      batchNumber: line.substring(87, 94)
    };
  }

  /**
   * Parse File Control record (record type 9)
   */
  parseFileControl(line) {
    return {
      recordType: '9',
      batchCount: parseInt(line.substring(1, 7)),
      blockCount: parseInt(line.substring(7, 13)),
      entryAndAddendaCount: parseInt(line.substring(13, 21)),
      entryHash: line.substring(21, 31),
      totalDebitEntryAmount: parseFloat(line.substring(31, 43)) / 100,
      totalCreditEntryAmount: parseFloat(line.substring(43, 55)) / 100,
      reserved: line.substring(55, 94)
    };
  }

  /**
   * Get human-readable transaction code description
   */
  getTransactionCodeDescription(code) {
    const codes = {
      '22': 'Credit to Checking Account',
      '23': 'Credit to Savings Account',
      '27': 'Debit to Checking Account',
      '28': 'Debit to Savings Account',
      '32': 'Credit to Checking - Prenote',
      '33': 'Credit to Savings - Prenote',
      '37': 'Debit to Checking - Prenote',
      '38': 'Debit to Savings - Prenote'
    };
    return codes[code] || `Unknown code: ${code}`;
  }

  /**
   * Search across all entries
   */
  search(query, type = 'all') {
    if (!this.parsedData) return [];

    const results = [];
    const lowerQuery = query.toLowerCase();

    this.parsedData.batches.forEach((batch, batchIndex) => {
      batch.entries.forEach((entry, entryIndex) => {
        let matches = false;

        if (type === 'all' || type === 'account') {
          if (entry.receivingDFIAccountNumber.toLowerCase().includes(lowerQuery)) {
            matches = true;
          }
        }

        if (type === 'all' || type === 'amount') {
          if (entry.amount.toString().includes(lowerQuery)) {
            matches = true;
          }
        }

        if (type === 'all' || type === 'trace') {
          if (entry.traceNumber.toLowerCase().includes(lowerQuery)) {
            matches = true;
          }
        }

        if (type === 'all' || type === 'name') {
          if (entry.individualName.toLowerCase().includes(lowerQuery)) {
            matches = true;
          }
        }

        if (matches) {
          results.push({
            entry,
            batchIndex,
            entryIndex,
            batchName: batch.companyName
          });
        }
      });
    });

    return results;
  }

  /**
   * Export data to CSV format
   */
  exportToCSV() {
    if (!this.parsedData) return '';

    let csv = 'Batch,Company,Transaction Code,Transaction Description,Account Number,Account Type,Individual Name,Amount,Trace Number\n';

    this.parsedData.batches.forEach(batch => {
      batch.entries.forEach(entry => {
        const accountType = entry.transactionCode === '22' || entry.transactionCode === '32' ? 'Checking' : 'Savings';
        const transactionType = ['22', '23', '32', '33'].includes(entry.transactionCode) ? 'Credit' : 'Debit';

        csv += `"${batch.batchNumber}","${batch.companyName}","${entry.transactionCode}","${entry.transactionCodeDescription}","${entry.receivingDFIAccountNumber}","${accountType}","${entry.individualName}",${entry.amount},"${entry.traceNumber}"\n`;
      });
    });

    return csv;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NACHAParser;
}
