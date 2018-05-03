import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
const now = new Date();

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {
  model: NgbDateStruct;
  date: { year: number, month: number };

  selectToday() {
    this.model = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }

  constructor() { }

  ngOnInit() {
  }

}
