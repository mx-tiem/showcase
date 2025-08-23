import { Component, Input, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import * as chartData from '../../../../public/data/podaci.json';
import { WidgetInterface } from '../widget/widget';

@Component({
  selector: 'app-chart',
  imports: [BaseChartDirective],
  templateUrl: './chart.html',
  styleUrl: './chart.scss'
})
export class Chart implements OnInit{
  @Input() widget!: WidgetInterface
  data: {hour: number, value: number}[] = []

  chartValues: Array<number> = [];
  chartData: Array<any> = [];
  chartLabels: Array<string> = [];
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
  }

  ngOnInit(): void {
    this.parseData()
  }

  parseData() {
    let tempVar: any = chartData
    Object.keys(tempVar).forEach(hour => {
      if (hour != 'default') {
        let tempValues = tempVar[hour]
        let totalOfValues = 0
        for (let i = 0; i < tempValues.length; i++) {
          totalOfValues += tempValues[i].value
        }
        this.data.push({
          hour: new Date(hour).getHours(),
          value: +(totalOfValues / tempValues.length).toFixed(2)
        })
      }
    })

    this.chartLabels = this.data.map(dataRow => dataRow.hour + 'h')
    this.chartValues = this.data.map(dataRow => dataRow.value)
    this.chartData.push({
      data: this.chartValues,
      label: this.widget.chartType,
      type: this.widget.chartType
    })
  }
}
