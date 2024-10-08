import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  private baseUrl = 'http://localhost:8094/api/excel';

  constructor(private http: HttpClient) { }

  parseExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Exclure la première ligne (les en-têtes de colonnes)
        const formattedData = this.formatData(jsonData.slice(1));
        resolve(formattedData);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsArrayBuffer(file);
    });
  }

  private formatData(data: any[]): any[] {
    return data.map(row => {
      const formattedRow = {
        typeIdDeclarant: this.formatBigDecimal(row[0]),
        idDeclarant: row[1] || null,
        catDeclarant: row[2] || null,
        acteDepot: this.formatBigDecimal(row[3]),
        anneeDepot: this.formatBigDecimal(row[4]),
        moisDepot: this.formatBigDecimal(row[5]),
        mfTypeIdBenif: this.formatBigDecimal(row[6]),
        mfIdBenif: row[7] || null,
        mfCatBenif: row[8] || null,
        cinTypeIdBenif: this.formatBigDecimal(row[9]),
        cinIdBenif: row[10] || null,
        cinDateNaiss: this.convertExcelDate(row[11]),
        cinCatBenif: row[12] || null,
       // passeportTypeIdBeni: this.formatBigDecimal(row[13]),
       // passeportIdBeni: row[14] || null,
       // passeportDateNaiss: this.convertExcelDate(row[15]),
       // passeportPays: row[16] || null,
       // passeportCatBenif: row[17] || null,
       // carteSejourTypeIdBeni: row[18] || null,
       // carteSejourIdBeni: row[19] || null,
       // carteSejourDateNaiss: this.convertExcelDate(row[20]),
       // carteSejourPays: row[21] || null,
       // carteSejourCatBeni: row[22] || null,
       // autreIdTypeIdBeni: row[23] || null,
       // autreIdIdBenif: row[24] || null,
       // autreIdPays: row[25] || null,
       // autreIdCatBenif: row[26] || null,
        resident: this.formatBigDecimal(row[13]),
        nomOuRs: row[14] || null,
        adresseBenif: row[15] || null,
        activite: row[16] || null,
        adresseMail: row[17] || null,
        numTel: row[18] || null,
        datePaiement: this.convertExcelDate(row[19]),
        refCertifDecl: row[20] || null,
        idOperation: row[21] || null,
        anneeFacture: this.formatBigDecimal(row[22]),
        cNPC: this.formatBigDecimal(row[23]),
        priseEnCharge: this.formatBigDecimal(row[24]),
        montantHT: this.formatBigDecimal(row[25]),
        tauxRS: this.formatBigDecimal(row[26]),
        tauxTVA: this.formatBigDecimal(row[27]),
        montantTVA: this.formatBigDecimal(row[28]),
        montantTTC: this.formatBigDecimal(row[29]),
        montantRS: this.formatBigDecimal(row[30]),
        taxeAddCode: row[31] || null,
        taxeAddMontant: this.formatBigDecimal(row[32]),
        montantNetServi: this.formatBigDecimal(row[33]),
        montantTotalHT: this.formatBigDecimal(row[34]),
        montantTotalTVA: this.formatBigDecimal(row[35]),
        montantTotalTTC: this.formatBigDecimal(row[36]),
        montantTotalRS: this.formatBigDecimal(row[37]),
      //  deviseCode: row[39] || null,
      //  deviseTotalRS: this.formatBigDecimal(row[40]),
      //  deviseTotalTTC: this.formatBigDecimal(row[41]),
      //  deviseTotalNetServi: this.formatBigDecimal(row[42]),
        totalTaxeAddCode:  this.formatBigDecimal(row[38]), 
        totalTaxeAddMontant: this.formatBigDecimal(row[39]), 
        monNetServi: this.formatBigDecimal(row[40]),
        flags: row[41] || 'N'     
        // flags: row[57] || null
      };
      console.log('Formatted Row:', formattedRow);  
      return formattedRow;
    });
  }

  private formatBigDecimal(value: any): string | null {
    if (typeof value === 'number') {
      return value.toFixed(2).replace('.', ',');
    } else if (typeof value === 'string') {
      const parsedValue = parseFloat(value.replace(',', '.'));
      return isNaN(parsedValue) ? null : parsedValue.toFixed(2).replace('.', ',');
    }
    return null;
  }

  private convertExcelDate(value: any): string | null {
    if (typeof value === 'number') {
      // Conversion des numéros de série Excel en objets Date
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        const formattedDate = `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
        console.log('Converted Date:', formattedDate);
        return formattedDate;
      }
    }
    return this.formatDate(value); // Utilisation de la méthode existante pour les chaînes et les objets Date
  }

  private formatDate(value: any): string | null {
    if (value instanceof Date && !isNaN(value.getTime())) {
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      console.log('Formatted Date 0:', formattedDate); 
      return formattedDate;
    } else if (typeof value === 'string') {
      const [day, month, year] = value.split('/');
      if (day && month && year) {
        const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        console.log('Formatted Date 1:', formattedDate); 
        return formattedDate;
      }
    }
    return null;
  }

  uploadData(data: any[]): Observable<any> {
    console.log('Data before upload:', data);  
    return this.http.post(`${this.baseUrl}/uploadData`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Upload Error:', error);  
        return throwError(() => new Error('Upload failed'));
      })
    );
  }
}
