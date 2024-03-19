import { Component, OnInit,ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/commonfunc.service';
import { WebapiService } from 'src/app/services/webapi.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import * as Highcharts from 'highcharts';

declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

import Histogram from 'highcharts/modules/histogram-bellcurve';
Histogram(Highcharts);

const Exporting = require('highcharts/modules/exporting');
Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  //it is used for the data chart
  public activity: any;
  public xData: any;
  public label: any;
  // options:any;


  //it is used for the data table
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  filterJson : any = {min : [],max:[]}
  DropDown  = ["Ph",'EC','EC_Th1','EC_Th2','PH_Th1','PH_Th2',"Temp"]
  mycheck!:number;
  selectedType!:string;
  modal:any

  user: any;
  wish = 'Good Morning';
  date = new Date();

  form: FormGroup;
  filterdata :FormGroup;
  Submitted: boolean;

  bsRangeValue: Date;
  bsValue = new Date();
  Btnsuccess: boolean = false;
  Main_data: any=[];
  header: any;
  
  Farmer_IDS:any;
  Reading_Types: any;
  macIDS: any;
  farm_id: any;
  macID: any;
  deviceID:any;
  deviceIDS:any;
  reading_type: any;
  from_Date: Date;
  To_Date: Date;
  NoOrders: boolean = false;
  NoData: boolean = false;
  JsonData:any=[];
  Ph_data:any= []

  constructor(
    public CF: CommonService,
    private fb: FormBuilder,
    private API: WebapiService,
    private modalService: NgbModal
  ) {

    this.CF.generateTags({
      title: 'UrbanKisaan | Dashboard',
      description: '',
      keywords: '',
      image: '',
      path: 'dashboard',
    });
    if (this.CF.isBrowser) {
      const curHr = this.date.getHours();
      curHr < 12 ? (this.wish = 'Good Morning') : curHr < 16 ? 
      (this.wish = 'Good Afternoon')  : (this.wish = 'Good Evening');
    }

      // this.API.Token().then((r:any)=>{
      //  localStorage.setItem('Access_Token', r.accessToken)
      //  if(r) {
        this.Get_farmeId();
        this.Get_macId();
        this.Get_deviceId();
        this.Get_readingtypes();
      //  }
      // })

  }

  ngOnInit(): void {
    this.form = this.fb.group({
      fromdate: [''],
      todate: [''],
      farmid: ['',],
      macID: [''],
      readingtype: ['',],
      deviceID:[''],
    });
    for(let i=0 ; i < this.DropDown.length;i++){
      this.filterJson.min.push(NaN)
      this.filterJson.max.push(NaN)
    }


    // this.API.Token().then((r: any) => {
    //   console.log(r.accessToken);
    //   localStorage.setItem('Access_Token', r.accessToken);
    //   if (r.accessToken) {
          // this.API.Get_Datareadings().then((r: any) => {
          //   console.log(r);
          //   if(r) {
          //     this.NoOrders = false;
          //     this.header = r.records[0] ? Object.keys(r.records[0]) : [];
          //     this.header=this.header.filter((o: any) =>  o !== 'sno');
          //     console.log(this.header)
          //       this.Main_data = r.records;
          //       console.log(this.Main_data)
          //   }
          // });
      // }
    // });
    // this.Get_TableData();
  }
  open(mymodal: any) {
    this.modal=this.modalService.open(mymodal)
    console.log(mymodal)
  }


  ngOnDestroy(): void {
    // We remove the last function in the global ext search array so we do not add the fn each time the component is drawn
    // /!\ This is not the ideal solution as other components may add other search function in this array, so be careful when
    // handling this global variable
    $.fn['dataTable'].ext.search.pop();
  }
  Clear(){
    this.from_Date;
    this.To_Date;
    this.macID="";
    this.deviceID="";
    this.farm_id="";
    this.reading_type="";
  }
  filterById(): void {
    // console.log(this.DropDown)
    $.fn['dataTable'].ext.search.push((settings:any, data:any, dataIndex:any) => {
      // const id = parseFloat(data[this.mycheck+1]) || 0; // use data for the id column
      
      let loopAllCondition:boolean =true;
      for (let i = 0; i < this.DropDown.length; i++){
        this.mycheck = (this.header).indexOf(this.DropDown[i])  
        let id = parseFloat(data[this.mycheck+1]) || 0;
          console.log("Id",id)
          console.log("Field",this.DropDown[i])
          console.log("Index ",i)
          console.log("Min value ",this.filterJson.min[i])
          console.log("Max value ",this.filterJson.max[i])
          console.log("---------------------")
          // console.log(data[i]) 
          loopAllCondition = loopAllCondition && (
            isNaN(this.filterJson.min[i]) && isNaN(this.filterJson.max[i]) ||
           (isNaN(this.filterJson.min[i]) && id <= this.filterJson.max[i]) ||
           (this.filterJson.min[i] <= id && isNaN(this.filterJson.max[i])) ||
           this.filterJson.min[i] <= id && id <= this.filterJson.max[i]);
           console.log(loopAllCondition);
           
      }
      if(loopAllCondition){return true;}
      // (this.DropDown).forEach((r:any)=>{
      //   console.log(r)
      // })
      // if ((isNaN(this.min) && isNaN(this.max)) ||
      //   (isNaN(this.min) && id <= this.max) ||
      //   (this.min <= id && isNaN(this.max)) ||
      //   (this.min <= id && id <= this.max)) {
      //   return true;
      // }
      return false;
    });
    this.modal.close();
    this.mycheck = (this.header).indexOf(this.selectedType)
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
    
  }

  Get_TableData() {
    this.NoOrders = true;
    this.API.Get_Datareadings().then((r: any) => {
      console.log(r);
      if(r) {
        this.NoOrders = false;
        this.header = r.records[0] ? Object.keys(r.records[0]) : [];
        this.header=this.header.filter((o: any) =>  o !== 'sno');
        console.log(this.header)
          this.Main_data = r.records;
          // console.log(this.Main_data)

      }
    });
  }

  Get_farmeId() {
    this.API.Get_Farmers().then((r: any) => {
      // console.log(r);
      this.Farmer_IDS = r;
      this.Farmer_IDS.map((r: any) => { r.item_id = r.id, r.item_text = r.id });
    });
  }

  Get_macId() {
    this.API.Get_macID().then((r: any) => {
      console.log(r);
      this.macIDS = r;
      this.macIDS.map((r: any) => { r.item_id = r.id, r.item_text = r.id });
    });
  }
  Get_deviceId() {
    this.API.Get_deviceID().then((r: any) => {
      console.log(r);
      this.deviceIDS = r;
      this.deviceIDS.map((r: any) => { r.item_id = r.id, r.item_text = r.id });
    });
  }

  Get_readingtypes() {
    this.API.Get_ReadingTypes().then((r: any) => {
      // console.log(r);
      this.Reading_Types = r;
      this.Reading_Types.map((r: any) => { r.item_id = r.id, r.item_text = r.id });
    });
  }
  resetFilter(){
    for(let i =0 ; i< this.filterJson.min.length; i++){
      this.filterJson.min[i]=NaN;
      this.filterJson.max[i]=NaN;
    }
  }
  onDateChange(e: Date) {
    // console.log(e);
    this.from_Date = e;
  }

  onDateChange_to(e: Date) {
    // console.log(e);
    this.To_Date = e;
  }

  onItemSelect(item: any) {
    // console.log(item);
    this.farm_id = item.item_id;
  }

  onItemDeSelect(item: any) {
    // console.log(item);
    // console.log(this.farm_id);
    this.farm_id = ""
    // console.log(this.farm_id);
  }

  onItemSelect_mac(item: any) {
    // console.log(item);
    this.macID = item.item_id;
  }
  onItemDeSelect_mac(item: any) {
    // console.log(item);
    this.macID = "";
  }
  onItemSelect_device(item: any) {
    // console.log(item);
    this.deviceID = item.item_id;
  }
  onItemDeSelect_device(item: any) {
    // console.log(item);
    this.deviceID = "";
  }

  onItemSelect_reading(item: any) {
    // console.log(item);
    this.reading_type = item.item_id;
  }

  onItemDeSelect_reading(item: any) {
    // console.log(item);
    this.reading_type = "";
  }

  Submit() {
    $.fn['dataTable'].ext.search.pop();
    this.Submitted = true;
    if (!this.form.invalid) {
      this.Ph_data=[];
      this.Main_data = [];
      this.NoOrders = true;
      this.Btnsuccess = true;
      // const body = {
      //   fromDate: this.from_Date,
      //   toDate: this.To_Date,
      //   deviceid: this.macID ? this.macID : '',
      //   readingtype: this.reading_type ? this.reading_type : '',
      //   farmid: this.farm_id.toString()? this.farm_id.toString(): '' ,
      //   limitRows: "999",
      // };

      let body = {
        "FromDate": this.from_Date,
         "ToDate": this.To_Date,
         "readingtype":this.reading_type,
         "macID":this.macID,
         "farmid":this.farm_id,
         "deviceId":this.deviceID
        }
        console.log(body)
      // return
      this.API.Date_Time_Filter_New(body).then((r: any) => {
        // console.log(r);
        this.Btnsuccess = false;
        this.NoOrders = false
        const totaldata = JSON.parse(r) ? JSON.parse(r) : [];
        this.header = totaldata[0] ? Object.keys(totaldata[0]) : [];
        // this.header=this.header.filter((o: any) =>  o !== 'sno');
          // console.log(this.header)
          this.Main_data = totaldata;
          let Ph_data=[]
          let Ec_data = []
          let option1:any;
          let option2:any;
          let option3:any;
          let datepicker :any=[];
          // console.log(this.Main_data)
        this.Main_data.forEach((r:any)=>{
        Ph_data.push(r.Ph);
        Ec_data.push(r.EC);
        datepicker.push([Date.parse(r.Transdate),r.Ph])
      })
      option1 = {
        title: {
            text: 'PH Histogram'
        },
    
        xAxis: [{
            title: { text: '' },
            alignTicks: false
        }, {
            title: { text: 'Ph value' },
            alignTicks: false,
            opposite: false
        }],
    
        yAxis: [{
            title: { text: '' }
        }, {
            title: { text: 'Frequavcy' },
            opposite: true
        }],
    
        plotOptions: {
            histogram: {
                accessibility: {
                    pointDescriptionFormatter: function (point:any) {
                      console.log(point)
                        var ix = point.index + 1,
                            x1 = point.x.toFixed(),
                            x2 = point.x2.toFixed(),
                            val = point.y;
                        return ix + '. ' + x1 + ' to ' + x2 + ', ' + val + '.';
                    }
                }
            }
        },
    
        series: [{
          name: 'Ph Value',
          type: 'histogram',
          xAxis: 1,
          yAxis: 1,
          baseSeries: 's1',
          data: Ph_data,
          zIndex: -1,
          id: 's1'
          
      }]
    };
    option2 = {
      title: {
          text: 'EC Histogram'
      },
  
      xAxis: [{
          title: { text: '' },
          alignTicks: false
      }, {
          title: { text: 'EC value' },
          alignTicks: false,
          opposite: false
      }],
  
      yAxis: [{
          title: { text: '' }
      }, {
          title: { text: 'Frequavcy' },
          opposite: true
      }],
  
      plotOptions: {
          histogram: {
              accessibility: {
                  pointDescriptionFormatter: function (point:any) {
                    console.log(point)
                      var ix = point.index + 1,
                          x1 = point.x.toFixed(),
                          x2 = point.x2.toFixed(),
                          val = point.y;
                      return ix + '. ' + x1 + ' to ' + x2 + ', ' + val + '.';
                  }
              }
          }
      },
  
      series: [{
        name: 'EC Value',
        type: 'histogram',
        xAxis: 1,
        yAxis: 1,
        baseSeries: 's1',
        data: Ec_data,
        zIndex: -1,
        id: 's1'
        
    }]
    
  };
  option3= {
    chart: {
       zoomType: 'x'
    },
    title: {
        text: ''
    },
    subtitle: {
        text: document.ontouchstart === undefined ?
            'Drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
    },
    xAxis: {
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: 'PH'
        }
    },
    legend: {
        enabled: false
    },
    plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, '#bfd4f5'],
                            [1, '#bfd4f5']
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },
    series: [{
                type: 'area',
                name: 'Date to Ph value',
                data: datepicker
            }]
  }

  
    
        Highcharts.chart('Ph', option1);
        Highcharts.chart('Ec', option2);
        Highcharts.chart('container', option3);
          
      // this.Main_data.forEach((r:any)=>{
      //   console.log(r.jsondata)
      // })
          if(this.Main_data.length === 0) {
            this.NoData = true;
          }
      });
    }
  }

}
