let logs = [];

function createLog(entry) {
  const log = { ...entry, timestamp: new Date() };
  logs.push(log);
  return log;
}

function getLogs(qrId) {
  return logs.filter(l => l.qrId === qrId).sort((a, b) => b.timestamp - a.timestamp);
}

module.exports = { createLog, getLogs };