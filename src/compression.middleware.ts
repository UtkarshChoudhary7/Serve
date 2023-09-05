import { Request, Response, NextFunction } from "express";
import { createReadStream, existsSync, lstatSync } from "fs";
import { resolve } from "path";
import { compress, getHeaders } from "./utils";

export const serveWithRealtimeCompression = (dir: string = './', useBrotli: boolean) => (req: Request, res: Response, next: NextFunction) => {
  const root = resolve(dir);
  const fileOrDirPath = resolve(root, `./${req.url}`);
  let filePath = fileOrDirPath;

  const acceptedEncodings: string[] = (req.headers["accept-encoding"] as string | undefined)?.split(',').map(e => e.trim()) || [];

  try {
    if (existsSync(fileOrDirPath)) {
      if (lstatSync(fileOrDirPath).isDirectory()) {
        filePath = resolve(fileOrDirPath, 'index.html');
      }
  
      res.set(getHeaders(filePath));

      const stream = createReadStream(filePath);

      if (acceptedEncodings.includes('br') && useBrotli) {
        compress('br', stream, res).catch(console.log);
      } else if (acceptedEncodings.includes('gzip')) {
        compress('gzip', stream, res);
      } else {
        stream.on('end', next);
        stream.pipe(res);
      }
    } else {
      throw Error('File or directory does not exist');
    }
  } catch (error) {
    console.log(error);
    next();
  }
};

export const servePreCompressedFiles = (dir: string = './', useBrotli: boolean) => (req: Request, res: Response, next: NextFunction) => {
  const root = resolve(dir);
  const fileOrDirPath = resolve(root, `./${req.url}`);
  let filePath = fileOrDirPath;

  const acceptedEncodings: string[] = (req.headers["accept-encoding"] as string | undefined)?.split(',').map(e => e.trim()) || [];

  try {
    if (existsSync(fileOrDirPath)) {
      if (lstatSync(fileOrDirPath).isDirectory()) {
        filePath = resolve(fileOrDirPath, 'index.html');
      }

      res.set(getHeaders(filePath));

      if (acceptedEncodings.includes('br') && existsSync(`${filePath}.br`) && useBrotli) {
        filePath += '.br';
        res.setHeader('Content-Encoding', 'br');
      } else if (acceptedEncodings.includes('gzip') && existsSync(`${filePath}.gz`)) {
        filePath += '.gz';
        res.setHeader('Content-Encoding', 'gzip');
      }

      createReadStream(filePath).pipe(res);
    } else {
      throw Error(`File or directory does not exist: ${fileOrDirPath}`);
    }
  } catch (error) {
    console.log(error);
    next();
  }
};
