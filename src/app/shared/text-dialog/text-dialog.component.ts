import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-dialog',
  templateUrl: './text-dialog.component.html',
  styleUrls: ['./text-dialog.component.scss']
})
export class TextDialogComponent implements OnInit {
  
  @Input('modal-border-radius')
  public borderRadius: string = '11px';

  constructor() { }

  ngOnInit(): void {
  }

}
