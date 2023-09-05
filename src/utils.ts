import { Response } from "express";
import { ReadStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { createBrotliCompress, createGzip } from "zlib";
import { getType } from 'mime';


export const compress = async (encoding: string, stream: ReadStream, res: Response<any, Record<string, any>>) => {
  const pipe = promisify(pipeline);
  const compressor = encoding === 'br' ? createBrotliCompress() : createGzip();
  res.setHeader('Content-Encoding', encoding);
  await pipe(stream, compressor, res);
};

export const getHeaders = (filePath: string) => ({
  'Content-Type': getType(filePath) || '',
  'Vary': 'Accept-Encoding',
  'Cache-Control': 'max-age=1209600'
});