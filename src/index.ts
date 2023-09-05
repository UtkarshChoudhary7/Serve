import express from 'express';
import yargs from 'yargs/yargs';
import { servePreCompressedFiles, serveWithRealtimeCompression } from './compression.middleware';

const { dir, port, compressInRealtime, useBrotli } = yargs(process.argv.slice(2)).options({
  dir: { type: 'string', alias: 'd', default: './' },
  port: { type: 'number', alias: 'p', default: 8080 },
  compressInRealtime: { type: 'boolean', alias: 'c', default: false },
  useBrotli: { type: 'boolean', alias: 'b', default: false }
}).parseSync();

const app = express();

// Add Brotli and Gzip compression middleware
app.use(compressInRealtime ? serveWithRealtimeCompression(dir, useBrotli) : servePreCompressedFiles(dir, useBrotli));

app.listen(port, () => {
  console.log(`Server started on port ${port}, serving ${dir}`);
  useBrotli && console.log('Using Brotli compression if supported by browser');
  console.log(compressInRealtime ? 'Compressing files on demand before serving' : 'Serving precompressed files if available');
});
