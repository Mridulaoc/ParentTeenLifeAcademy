import CertificateModel from "../../infrastructure/database/certificateModel";
import { ICertificate } from "../entities/Certificate";

export interface ICertificateRepository {
  create(certificate: ICertificate): Promise<ICertificate>;
}

export class CertificateRepository implements ICertificateRepository {
  async create(certificate: ICertificate): Promise<ICertificate> {
    try {
      const newCertificate = new CertificateModel(certificate);
      return await newCertificate.save();
    } catch (error) {
      console.error("Error creating certificate:", error);
      throw error;
    }
  }
}
