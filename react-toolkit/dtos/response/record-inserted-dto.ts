/** To receive newly inserted record's id as response */
interface RecordInsertedDto {
  /** Newly created record's primary key (Guid) */
  id: string;
}

export { type RecordInsertedDto };
