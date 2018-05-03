import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiDocumentService } from './service/api-document.service';
import { NgSelectModule, NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';



import { AppComponent } from './app.component';
import { DropdownsComponent } from './component/dropdowns/dropdowns.component';
import { DatePickerComponent } from './component/date-picker/date-picker.component';
import { HeaderComponent } from './component/header/header.component';
import { HttpModule } from '@angular/http';
import { DndModule } from 'ng2-dnd';
import * as _ from 'lodash';



const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    DropdownsComponent,
    DatePickerComponent,
    HeaderComponent,


  ],
  imports: [
    BrowserModule,
    NgSelectModule,
    HttpModule,
    FormsModule,
    PerfectScrollbarModule,
    NgbModule.forRoot(),
    DndModule.forRoot(),
  ],
  providers: [
    ApiDocumentService,
    {
      provide: NG_SELECT_DEFAULT_CONFIG,
      useValue: {
        notFoundText: 'Custom not found'
      }
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
