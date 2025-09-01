import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Input() total: number = 0;

  // "normal" (Prev/Next) or "google" (1 ... 5 6 7 ... n)
  @Input() mode: 'normal' | 'google' = 'google';

  @Output() pageChange = new EventEmitter<number>();

  goToPage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.pageChange.emit(newPage);
  }

  // Google-like pagination range
  get paginationRange(): (number | string)[] {
    const range: (number | string)[] = [];
    const delta = 2; // how many pages to show around current page

    const left = Math.max(2, this.page - delta);
    const right = Math.min(this.totalPages - 1, this.page + delta);

    range.push(1);

    if (left > 2) range.push('...');

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < this.totalPages - 1) range.push('...');

    if (this.totalPages > 1) range.push(this.totalPages);

    return range;
  }

  isNumber(val: string | number): val is number {
  return typeof val === 'number';
}
}
