export type MaybeArray<T> = T | T[];

export type FileFilterOptions = {
  ignoreDotFiles?: boolean;
  filename?: string;
  filenameRegex?: string;
  fileAgeMinMS?: number;
  fileAgeMaxMS?: number;
  fileDateMin?: Date;
  fileDateMax?: Date;
  fileSizeMinBytes?: number;
  fileSizeMaxBytes?: number;
  sortFilesBy?: 'name' | 'size' | 'date';
}

export type WriteOptions = {
  overwrite?: boolean;
  append?: boolean;
  // use null for binary
  encoding?: BufferEncoding;
}

export type AfterProcess = {
  action: 'delete' | 'move' | 'none';
  directory?: string;
  filename?: string; // if undefined, use original filename
}

export type FileReadConfig = {
  filterOptions?: FileFilterOptions;
  directory?: string;
  afterProcess?: AfterProcess;
  // _onErrorAction?: 'delete' | 'move' | 'none';
  // _onErrorDirectory?: string;
  // _onErrorFilename?: string;
  encoding?: BufferEncoding;
};
