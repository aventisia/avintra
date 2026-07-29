export interface SkillFileDto {
  id: string;
  fileName: string;
  fileSize: string;
  contentType?: string;
  fileType: string;
  content?: string;
  createdBy: string;
  createdOn: Date | string;
}
