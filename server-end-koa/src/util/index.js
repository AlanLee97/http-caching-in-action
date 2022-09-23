/**
 * 获取文件hash值
 * @env node
 * @param {string} filePath 
 * @returns 
 */
function getFileHash({
  filePath = '',
  file
}) {
  if(filePath) {
    const fs = require('fs');
    file =  fs.readFileSync(__dirname + filePath, 'utf-8');
  }
  if(file) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha1');
    const result = hash.update(file).digest('hex');
    return result;
  }
  return '';
}

module.exports = {
  getFileHash
}
