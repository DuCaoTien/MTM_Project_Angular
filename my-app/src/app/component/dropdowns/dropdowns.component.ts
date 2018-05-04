import { Component, OnInit } from '@angular/core';
import { ApiDocumentService } from '../../service/api-document.service'
import { uniq, countBy } from "lodash";
import _ = require('lodash');
@Component({
  selector: 'app-dropdowns',
  templateUrl: './dropdowns.component.html',
  styleUrls: ['./dropdowns.component.css']
})


export class DropdownsComponent implements OnInit {
  public apis: any[];

  searchTeamLeader;
  public teamLeaders = [];
  public get teamLeadersView() {
    return !!this.searchTeamLeader ?
      this.teamLeaders.filter(p => !!p.name && p.name.toLowerCase().indexOf(this.searchTeamLeader.toLowerCase()) > -1)
      : this.teamLeaders;
  }

  searchTeamMembers;
  public teamMembers:any = [];
  public get teamMembersView(){
    return !!this.searchTeamMembers ?
      this.teamMembers.filter(p => !!p.name && p.name.toLowerCase().indexOf(this.searchTeamMembers.toLowerCase()) > -1)
      : this.teamMembers;
  }


  searchconTractors;
  public conTractors = [];
  public get conTractorsView(){
    return !!this.searchconTractors ?
      this.conTractors.filter(a => !!a.name && a.name.toLowerCase().indexOf(this.searchconTractors.toLowerCase()) > -1)
      : this.conTractors;
  }

  searchowendPlant;
  public ownedPlant_Equipment = [];
  public get ownedPlantView(){
    return !!this.searchowendPlant ?
      this.ownedPlant_Equipment.filter(p => !!p.name && p.name.toLowerCase().indexOf(this.searchowendPlant.toLowerCase()) > -1)
      : this.ownedPlant_Equipment;
  }

  searchhiredPlant;
  public hiredPlant_Equipment = [];
  public get hiredPlantView(){
    return !!this.searchhiredPlant ?
      this.hiredPlant_Equipment.filter(p => !!p.name && p.name.toLowerCase().indexOf(this.searchhiredPlant.toLowerCase()) > -1)
      : this.hiredPlant_Equipment;
  }

  searchvehiCles;
  public vehiCles = [];
  public get vehiClesView() {
    return !!this.searchvehiCles ?
      this.vehiCles.filter(p => !!p.name && p.name.toLowerCase().indexOf(this.searchvehiCles.toLowerCase()) > -1)
      : this.vehiCles;
  }
  
  
  searchunAvailables;
  public unAvailables = [];
  public get unAvailablesView() {
    return !!this.searchunAvailables ?
      this.unAvailables.filter(p => !!p.name && p.name.toLowerCase().indexOf(this.searchunAvailables.toLowerCase()) > -1)
      : this.unAvailables;
  }
 
  searchonLeaveEmployees;
  public onLeaveEmployees = [];
  public get onLeaveEmployeesView() {
    return !!this.searchonLeaveEmployees ?
      this.onLeaveEmployees.filter(p => !!p.name && p.name.toLowerCase().indexOf(this.searchonLeaveEmployees.toLowerCase()) > -1)
      : this.onLeaveEmployees;
  }

  constructor(private apiDocumentService: ApiDocumentService) {

    var array = [1, 2, 3, 4, 5, 6,1,2];
    var arraytwo=_.uniq(array);
    console.log(arraytwo);
  }

  ngOnInit() {
    this.getApi();
  }

  getApi(): void {
    this.apiDocumentService.getApi().subscribe((response: any) => {

      this.teamLeaders = response['teamLeaders'];
      console.log(this.teamLeaders);
      this.teamLeaders.forEach(response => {
        response.Type = "TeamLeaders"
      });
   

      this.teamMembers = response['teamMembers'];
      console.log(this.teamMembers);
      this.teamMembers.forEach(response => {
        response.Type = 'TeamMembers'
      });

      
      

      this.conTractors = response['contractors'];
      this.ownedPlant_Equipment = response['ownedPlantEnquipments'];
      this.hiredPlant_Equipment = response['hiredPlantEquipments'];
      this.vehiCles = response['vehicles'];
      this.unAvailables = response['unAvailables'];
      this.onLeaveEmployees = response['onLeaveEmployees'];
      
      
  
  
    });
  }
  transferData: Object = { id: 1, msg: 'Hello' };
 


  receivedDataControllers: Array<any> = [];
  public dataControllers;
  transferDataControllersSuccess($event: any) {
    if ($event.dragData.Type == 'TeamMembers') {
      this.receivedDataControllers.push($event.dragData.name);
      this.dataControllers= _.countBy(this.receivedDataControllers);
      console.log(this.dataControllers, 111);
      this.dataControllers = Object.keys(this.dataControllers).map(key => ({ name: key}))
      return this.receivedDataControllers;
    }
  }

  receivedDataHired: Array<any> = [];
  public dataHired;
  transferDataHiredSuccess($event: any) {
    if ($event.dragData.type == 'HiredPlantEquipment') {
      this.receivedDataHired.push($event.dragData.name);
      this.dataHired = _.countBy(this.receivedDataHired);
      console.log(this.dataHired, 111);
      this.dataHired = Object.keys(this.dataHired).map(key => ({ name: key }))
      return this.receivedDataHired;
    }
  }

  receivedVehicles: Array<any> = [];
  public dataVehicle;
  transferDataVehicleSuccess($event: any) {
    if ($event.dragData.type == 'Vehicle') {
      this.receivedVehicles.push($event.dragData.name);
      this.dataVehicle = _.countBy(this.receivedVehicles);
      this.dataVehicle = Object.keys(this.dataVehicle).map(key => ({ name: key }))
      return this.receivedVehicles;
    }
  }

  receivedDataContractors: Array<any> = [];
  public dataContractors;
  transferDataContractorSuccess($event: any) {
    if($event.dragData.type == 'Contractor') {
      this.receivedDataContractors.push($event.dragData.name);
      this.dataContractors=_.countBy(this.receivedDataContractors);
      console.log(this.dataContractors,111);
      this.dataContractors = Object.keys(this.dataContractors).map(key => ({name: key, quantity: this.dataContractors[key]}))
      console.log(this.dataContractors);
      return this.receivedDataContractors;
    }
  }

  public receivedDataForeman = null;
  transferDataForemanSuccess($event: any) {
    if ($event.dragData.Type == 'TeamLeaders') {
      this.receivedDataForeman = $event.dragData.name;
      return this.receivedDataForeman;
    }
  }

  dataPlantEquipments: Array<any> = [];
  public receivedDataOwned = null;
  transferDataOwnedAssets($event: any) {
    if ($event.dragData.type == 'OwnedPlantEquipment'){
      this.receivedDataOwned = $event.dragData.name;
      console.log(this.receivedDataOwned,1111);
      return this.receivedDataOwned;
    }
  }


}



