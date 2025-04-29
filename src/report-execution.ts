export function newRecord() {
  const order: string[] = [];

  function reportExecution(entry: string) {
    order.push(entry);
  }

  function getCurrentExecutionOrder() {
    return order;
  }

  return {
    reportExecution,
    getCurrentExecutionOrder,
  };
}
export const REPORT_EXECUTION = (id: string) =>
  "reportExecution(" + JSON.stringify(id) + ")";
