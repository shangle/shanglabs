/**
 * NACHA File Validator for CCD (Corporate Credit/Debit) files
 * Validates against NACHA Operating Rules
 */

class NACHAValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate parsed NACHA data
   * @param {Object} data - Parsed data from NACHAParser
   * @returns {Object} Validation results
   */
  validate(data) {
    this.errors = [];
    this.warnings = [];

    if (!data) {
      this.errors.push('No data to validate');
      return { isValid: false, errors: this.errors, warnings: this.warnings };
    }

    // Check for large file performance warning
    if (data.totalRecords > 500) {
      this.warnings.push(`Large file detected (${data.totalRecords} records). Performance may be impacted. Processing may take a moment.`);
    }

    this.validateFileStructure(data);
    this.validateFileHeader(data.fileHeader);
    this.validateBatches(data.batches);
    this.validateFileControl(data, data.fileControl);

    const isValid = this.errors.length === 0;

    return {
      isValid,
      errors: this.errors,
      warnings: this.warnings,
      summary: this.generateSummary(data)
    };
  }

  /**
   * Validate overall file structure
   */
  validateFileStructure(data) {
    if (!data.fileHeader) {
      this.errors.push('Missing File Header record (record type 1)');
    }

    if (!data.fileControl) {
      this.errors.push('Missing File Control record (record type 9)');
    }

    if (data.batches.length === 0) {
      this.errors.push('No batches found in file');
    }

    // Check that record types appear in correct order
    const recordSequence = data.rawRecords.map(line => line.substring(0, 1));
    const expectedSequence = [];

    for (let i = 0; i < recordSequence.length; i++) {
      const type = recordSequence[i];
      if (type === '1' && i !== 0) {
        this.errors.push(`File Header (1) found at position ${i + 1}, should only be at start`);
      }
      if (type === '9' && i !== recordSequence.length - 1) {
        this.errors.push(`File Control (9) found at position ${i + 1}, should be at end`);
      }
    }
  }

  /**
   * Validate File Header record
   */
  validateFileHeader(header) {
    if (!header) return;

    // Validate record type
    if (header.recordType !== '1') {
      this.errors.push('File Header has invalid record type');
    }

    // Validate format code (should be 1 for fixed-length)
    if (header.formatCode !== '1') {
      this.errors.push(`Invalid Format Code in File Header: ${header.formatCode} (should be 1 for fixed-length records)`);
    }

    // Validate record size (should be 094)
    if (header.recordSize !== '094') {
      this.errors.push(`Invalid Record Size in File Header: ${header.recordSize} (should be 094)`);
    }

    // Validate blocking factor (should be 10)
    if (header.blockingFactor !== '10') {
      this.warnings.push(`Non-standard Blocking Factor in File Header: ${header.blockingFactor} (standard is 10)`);
    }

    // Validate date format (YYMMDD)
    if (!/^\d{6}$/.test(header.fileCreationDate)) {
      this.errors.push('Invalid File Creation Date format in File Header (should be YYMMDD)');
    }

    // Validate immediate destination routing number (10 characters, 9 digits + space)
    if (!/^\d{9} $/.test(header.immediateDestination)) {
      this.warnings.push('Immediate Destination routing number may be invalid (should be 9 digits + 1 space)');
    }

    // Validate immediate origin routing number
    if (!/^\d{9} $/.test(header.immediateOrigin)) {
      this.warnings.push('Immediate Origin routing number may be invalid (should be 9 digits + 1 space)');
    }

    // Validate standard entry class code
    if (header.standardEntryClassCode !== 'CCD') {
      this.errors.push(`Unsupported Standard Entry Class Code: ${header.standardEntryClassCode} (only CCD is supported)`);
    }
  }

  /**
   * Validate all batches
   */
  validateBatches(batches) {
    batches.forEach((batch, batchIndex) => {
      this.validateBatch(batch, batchIndex);
    });
  }

  /**
   * Validate a single batch
   */
  validateBatch(batch, batchIndex) {
    const batchNum = batch.batchNumber || batchIndex + 1;

    // Validate batch header
    if (batch.recordType !== '5') {
      this.errors.push(`Batch ${batchNum}: Invalid record type for Batch Header`);
    }

    // Validate service class code (200 = mixed debits/credits, 220 = credits only, 225 = debits only)
    const validServiceClasses = ['200', '220', '225'];
    if (!validServiceClasses.includes(batch.serviceClassCode)) {
      this.errors.push(`Batch ${batchNum}: Invalid Service Class Code: ${batch.serviceClassCode}`);
    }

    // Validate standard entry class code
    if (batch.standardEntryClassCode !== 'CCD') {
      this.errors.push(`Batch ${batchNum}: Invalid Standard Entry Class Code: ${batch.standardEntryClassCode} (should be CCD)`);
    }

    // Check for entries
    if (batch.entries.length === 0) {
      this.errors.push(`Batch ${batchNum}: No entry detail records found`);
    }

    // Validate each entry
    batch.entries.forEach((entry, entryIndex) => {
      this.validateEntryDetail(entry, batchNum, entryIndex);
    });

    // Validate batch control if present
    if (batch.batchControl) {
      this.validateBatchControl(batch, batchNum);
    } else {
      this.warnings.push(`Batch ${batchNum}: Missing Batch Control record`);
    }
  }

  /**
   * Validate Entry Detail record
   */
  validateEntryDetail(entry, batchNum, entryIndex) {
    // Validate record type
    if (entry.recordType !== '6') {
      this.errors.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Invalid record type for Entry Detail`);
    }

    // Validate transaction code
    const validTransactionCodes = ['22', '23', '27', '28', '32', '33', '37', '38'];
    if (!validTransactionCodes.includes(entry.transactionCode)) {
      this.errors.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Invalid Transaction Code: ${entry.transactionCode}`);
    }

    // Validate amount (should be non-negative)
    if (entry.amount < 0) {
      this.errors.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Negative amount found: ${entry.amount}`);
    }

    // Validate DFI routing number format
    if (!/^\d{8}$/.test(entry.receivingDFIIdentification)) {
      this.errors.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Invalid DFI Identification format: ${entry.receivingDFIIdentification}`);
    }

    // Validate check digit (should be a single digit)
    if (!/^\d$/.test(entry.checkDigit)) {
      this.errors.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Invalid check digit: ${entry.checkDigit}`);
    }

    // Validate account number (should not be empty or all spaces)
    if (!entry.receivingDFIAccountNumber || entry.receivingDFIAccountNumber.trim() === '') {
      this.errors.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Empty account number`);
    }

    // Validate trace number (15 digits for CCD)
    if (!/^\d{15}$/.test(entry.traceNumber)) {
      this.warnings.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Trace number may be invalid: ${entry.traceNumber} (should be 15 digits)`);
    }

    // Check for zero amounts
    if (entry.amount === 0) {
      this.warnings.push(`Batch ${batchNum}, Entry ${entryIndex + 1}: Zero amount entry found`);
    }
  }

  /**
   * Validate Batch Control record
   */
  validateBatchControl(batch, batchNum) {
    const control = batch.batchControl;

    // Validate record type
    if (control.recordType !== '8') {
      this.errors.push(`Batch ${batchNum}: Invalid record type for Batch Control`);
    }

    // Validate entry count matches
    const actualEntryCount = batch.entries.length;
    if (control.entryAndAddendaCount !== actualEntryCount) {
      this.errors.push(`Batch ${batchNum}: Entry count mismatch. Batch Control says ${control.entryAndAddendaCount}, found ${actualEntryCount} entries`);
    }

    // Validate batch number matches
    if (control.batchNumber !== batch.batchNumber) {
      this.errors.push(`Batch ${batchNum}: Batch number mismatch between Batch Header (${batch.batchNumber}) and Batch Control (${control.batchNumber})`);
    }

    // Validate ODFI Identification matches
    if (control.odfiIdentification !== batch.odfiIdentification) {
      this.errors.push(`Batch ${batchNum}: ODFI Identification mismatch between Batch Header and Batch Control`);
    }

    // Calculate actual debit and credit amounts
    let totalDebits = 0;
    let totalCredits = 0;

    batch.entries.forEach(entry => {
      if (['22', '23', '32', '33'].includes(entry.transactionCode)) {
        // Credit transactions
        totalCredits += entry.amount;
      } else {
        // Debit transactions
        totalDebits += entry.amount;
      }
    });

    // Validate amounts (allow for small floating point differences)
    if (Math.abs(control.totalDebitEntryAmount - totalDebits) > 0.01) {
      this.errors.push(`Batch ${batchNum}: Total debit amount mismatch. Batch Control says $${control.totalDebitEntryAmount.toFixed(2)}, calculated $${totalDebits.toFixed(2)}`);
    }

    if (Math.abs(control.totalCreditEntryAmount - totalCredits) > 0.01) {
      this.errors.push(`Batch ${batchNum}: Total credit amount mismatch. Batch Control says $${control.totalCreditEntryAmount.toFixed(2)}, calculated $${totalCredits.toFixed(2)}`);
    }
  }

  /**
   * Validate File Control record
   */
  validateFileControl(data, control) {
    if (!control) return;

    // Validate record type
    if (control.recordType !== '9') {
      this.errors.push('Invalid record type for File Control');
    }

    // Validate batch count
    if (control.batchCount !== data.batches.length) {
      this.errors.push(`Batch count mismatch. File Control says ${control.batchCount}, found ${data.batches.length} batches`);
    }

    // Calculate total entry count
    let totalEntries = 0;
    data.batches.forEach(batch => {
      totalEntries += batch.entries.length;
    });

    if (control.entryAndAddendaCount !== totalEntries) {
      this.errors.push(`Entry count mismatch. File Control says ${control.entryAndAddendaCount}, calculated ${totalEntries} entries`);
    }

    // Calculate totals
    let totalDebits = 0;
    let totalCredits = 0;

    data.batches.forEach(batch => {
      if (batch.batchControl) {
        totalDebits += batch.batchControl.totalDebitEntryAmount;
        totalCredits += batch.batchControl.totalCreditEntryAmount;
      } else {
        batch.entries.forEach(entry => {
          if (['22', '23', '32', '33'].includes(entry.transactionCode)) {
            totalCredits += entry.amount;
          } else {
            totalDebits += entry.amount;
          }
        });
      }
    });

    // Validate totals
    if (Math.abs(control.totalDebitEntryAmount - totalDebits) > 0.01) {
      this.errors.push(`Total debit amount mismatch. File Control says $${control.totalDebitEntryAmount.toFixed(2)}, calculated $${totalDebits.toFixed(2)}`);
    }

    if (Math.abs(control.totalCreditEntryAmount - totalCredits) > 0.01) {
      this.errors.push(`Total credit amount mismatch. File Control says $${control.totalCreditEntryAmount.toFixed(2)}, calculated $${totalCredits.toFixed(2)}`);
    }
  }

  /**
   * Generate summary statistics
   */
  generateSummary(data) {
    let totalEntries = 0;
    let totalDebits = 0;
    let totalCredits = 0;

    data.batches.forEach(batch => {
      totalEntries += batch.entries.length;
      batch.entries.forEach(entry => {
        if (['22', '23', '32', '33'].includes(entry.transactionCode)) {
          totalCredits += entry.amount;
        } else {
          totalDebits += entry.amount;
        }
      });
    });

    return {
      batchCount: data.batches.length,
      totalEntries,
      totalDebits,
      totalCredits,
      netAmount: totalCredits - totalDebits
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NACHAValidator;
}
