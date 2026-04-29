import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-color-filter',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './color-filter.component.html',
  styleUrls: ['./color-filter.component.scss'],
})
export class ColorFilterComponent implements OnChanges {
  @Input() colors: string[] = [];
  @Output() activeColorsChange = new EventEmitter<Set<string>>();

  activeColors = new Set<string>();

  ngOnChanges(): void {
    this.activeColors = new Set(this.colors);
  }

  toggle(color: string): void {
    this.activeColors.has(color)
      ? this.activeColors.delete(color)
      : this.activeColors.add(color);

    this.activeColorsChange.emit(new Set(this.activeColors));
  }
}
