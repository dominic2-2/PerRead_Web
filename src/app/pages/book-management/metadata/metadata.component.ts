import { Component } from '@angular/core';
import { AuthorListComponent } from './author/author-list.component';
import { CategoryListComponent } from './category/category-list.component';
import { PublisherListComponent } from './publisher/publisher-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonToggleModule, AuthorListComponent, CategoryListComponent, PublisherListComponent]
})
export class MetadataComponent {
  tab: 'author' | 'category' | 'publisher' = 'author';
} 