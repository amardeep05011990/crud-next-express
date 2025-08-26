import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  testimonials = [
  { name: 'Amit Sharma', feedback: 'The teachers are very supportive.', course: 'Mathematics', image: 'https://i.pravatar.cc/60?img=5' },
  { name: 'Priya Singh', feedback: 'Amazing learning experience!', course: 'Science', image: 'https://i.pravatar.cc/60?img=15' },
  { name: 'Ravi Kumar', feedback: 'Great campus and friendly environment.', course: 'Arts', image: 'https://i.pravatar.cc/60?img=8' }
];

}
