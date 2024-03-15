import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import * as XLSX from 'xlsx';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExcelToJsonService {
  transferData = new Subject();
  constructor() {}

  public convertExcelToJson(file: File): void {
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const firstSheetName: string = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log(jsonData);
      this.transferData.next(jsonData);
    };

    reader.readAsBinaryString(file);
  }
}
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  orderForm: FormGroup;
  questionsArray: FormArray;

  constructor(
    private formBuilder: FormBuilder,
    private excelServce: ExcelToJsonService
  ) {}

  ngOnInit() {
    this.orderForm = new FormGroup({
      questionsArray: new FormArray([]),
    });
    this.excelServce.transferData.subscribe((res: any) => {
      res.forEach((element: any, index: any) => {
        this.addItem();
        this.questionsArray.controls[index].patchValue(element);
      });
    });
  }
  save() {
    console.log(this.orderForm.value);
  }
  createItem(): FormGroup {
    return this.formBuilder.group({
      'Questions': '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
    });
  }

  addItem(): void {
    this.questionsArray = this.orderForm.get('questionsArray') as FormArray;
    this.questionsArray.push(this.createItem());
  }
}

@Component({
  selector: 'mydara',
  template: `
    <input type="file" (change)="onFileSelected($event)">
  `,
})
export class Myderare {
  constructor(private excelToJsonService: ExcelToJsonService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.excelToJsonService.convertExcelToJson(file);
    }
  }
}
