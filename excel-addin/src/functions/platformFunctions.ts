/**
 * Financial Platform Custom Functions for Excel
 *
 * These functions allow Excel users to connect to the Financial Modeling Platform,
 * retrieve data, link cells across models, and access scenario-specific values.
 */

import { SyncEngine } from '../sync/SyncEngine';

// Initialize sync engine
const syncEngine = new SyncEngine();

/**
 * Fetches a value from another model in the Financial Platform.
 * @customfunction FP.GET
 * @param modelPath Path to the model (e.g., "Portfolio/CompA/DCF")
 * @param cellOrRange Cell address or named range to retrieve
 * @param version Optional version number (default: latest)
 * @returns The value from the specified location
 */
export async function fpGet(
  modelPath: string,
  cellOrRange: string,
  version?: number
): Promise<string | number> {
  try {
    const response = await syncEngine.fetchValue({
      modelPath,
      reference: cellOrRange,
      version: version ?? 'latest',
    });
    return response.value;
  } catch (error) {
    return `#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Creates a bidirectional link to another model in the platform.
 * Changes in either location will sync to the other.
 * @customfunction FP.LINK
 * @param modelPath Path to the model
 * @param cellOrRange Cell address or named range to link
 * @returns The linked value
 */
export async function fpLink(
  modelPath: string,
  cellOrRange: string
): Promise<string | number> {
  try {
    const response = await syncEngine.createLink({
      modelPath,
      reference: cellOrRange,
    });
    return response.value;
  } catch (error) {
    return `#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Returns the value from a specific scenario branch.
 * @customfunction FP.SCENARIO
 * @param scenarioName Name of the scenario (e.g., "Bear_Case", "Bull_Case")
 * @param cellReference Cell reference to evaluate in scenario context
 * @returns Value as calculated in the specified scenario
 */
export async function fpScenario(
  scenarioName: string,
  cellReference: string
): Promise<string | number> {
  try {
    const response = await syncEngine.getScenarioValue({
      scenario: scenarioName,
      reference: cellReference,
    });
    return response.value;
  } catch (error) {
    return `#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Streams live data to the cell. Updates automatically when source changes.
 * @customfunction FP.LIVE
 * @streaming
 * @param dataSource Data source identifier (e.g., "market", "platform")
 * @param identifier Asset or entity identifier
 * @param field Field to retrieve (e.g., "price", "volume")
 * @param invocation Streaming invocation handler
 */
export function fpLive(
  dataSource: string,
  identifier: string,
  field: string,
  invocation: CustomFunctions.StreamingInvocation<string | number>
): void {
  try {
    // Subscribe to real-time updates
    const unsubscribe = syncEngine.subscribeToLiveData(
      { source: dataSource, id: identifier, field },
      (data) => {
        invocation.setResult(data.value);
      },
      (error) => {
        invocation.setResult(`#ERROR: ${error.message}`);
      }
    );

    // Handle cancellation
    invocation.onCanceled = () => {
      unsubscribe();
    };
  } catch (error) {
    invocation.setResult(
      `#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generates a sensitivity analysis table.
 * @customfunction FP.SENSITIVITY
 * @param inputRange Range containing input assumption to vary
 * @param outputCell Cell containing output to measure
 * @param steps Number of steps in sensitivity (default: 10)
 * @returns 2D array with sensitivity results
 */
export async function fpSensitivity(
  inputRange: string,
  outputCell: string,
  steps: number = 10
): Promise<(string | number)[][]> {
  try {
    const response = await syncEngine.calculateSensitivity({
      inputAddress: inputRange,
      outputAddress: outputCell,
      steps,
      variationPercent: 20, // +/- 20% range
    });
    return response.matrix;
  } catch (error) {
    return [[`#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`]];
  }
}

/**
 * Retrieves audit information for a cell.
 * @customfunction FP.AUDIT
 * @param cellReference Cell reference to audit
 * @param field Field to retrieve (e.g., "last_modified_by", "last_modified_at", "version")
 * @returns The requested audit information
 */
export async function fpAudit(
  cellReference: string,
  field: string = 'last_modified_by'
): Promise<string> {
  try {
    const response = await syncEngine.getAuditInfo({
      reference: cellReference,
      field,
    });
    return response.value;
  } catch (error) {
    return `#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Gets comments associated with a cell from the platform.
 * @customfunction FP.COMMENT
 * @param cellReference Cell reference to get comments for
 * @returns The most recent comment text, or empty if none
 */
export async function fpComment(cellReference: string): Promise<string> {
  try {
    const response = await syncEngine.getComments({
      reference: cellReference,
    });
    return response.latestComment ?? '';
  } catch (error) {
    return `#ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Register functions with Office
CustomFunctions.associate('GET', fpGet);
CustomFunctions.associate('LINK', fpLink);
CustomFunctions.associate('SCENARIO', fpScenario);
CustomFunctions.associate('LIVE', fpLive);
CustomFunctions.associate('SENSITIVITY', fpSensitivity);
CustomFunctions.associate('AUDIT', fpAudit);
CustomFunctions.associate('COMMENT', fpComment);
