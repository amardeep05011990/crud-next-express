// ========= VIEW COMPONENT =========
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-students-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './students-view.component.html'
})
export class StudentsViewComponent implements OnInit {
  @Input() id: string | null = null;
  @Output() closed = new EventEmitter<void>();   // ✅ add this
  item: any = null;
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.id) {
      this.fetchItem();
    }
  }

  fetchItem() {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/api/students/${this.id}`).subscribe(res => {
      this.item = res;
      this.loading = false;
    }, _err => {
      this.item = null;
      this.loading = false;
    });
  }

  closeView() {
    this.closed.emit();   // ✅ now it notifies parent
  }
}