import { Component } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiDocumentService } from './service/api-document.service';
import { debounce } from 'lodash';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  restrictedDrop1: any = null;
  restrictedDrop2: any = null;
}


