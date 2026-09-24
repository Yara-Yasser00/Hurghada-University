import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { UniversityApiService } from '../core/university-api.service';
import { ToastService } from '../core/toast.service';
import { resolveMediaUrl } from '../core/media-url';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  template: `
    <div class="image-upload">
      <div class="image-upload__preview">
        @if (previewUrl()) {
          <img [src]="previewUrl()" [alt]="label" />
        } @else {
          <span class="image-upload__placeholder">{{ label }}</span>
        }
      </div>
      <div class="image-upload__actions">
        <label class="secondary-button image-upload__pick">
          {{ busy() ? 'Uploading…' : 'Upload image' }}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" (change)="onFile($event)" [disabled]="busy()" />
        </label>
        @if (value) {
          <button type="button" class="text-button" (click)="clear()" [disabled]="busy()">Remove</button>
        }
      </div>
      @if (hint) {
        <small class="image-upload__hint">{{ hint }}</small>
      }
    </div>
  `,
  styles: `
    .image-upload {
      display: grid;
      gap: 0.65rem;
    }
    .image-upload__preview {
      width: 100%;
      min-height: 140px;
      border: 1px dashed color-mix(in srgb, var(--navy, #0b2a4a) 28%, transparent);
      border-radius: 0.65rem;
      overflow: hidden;
      background: color-mix(in srgb, var(--navy, #0b2a4a) 4%, #fff);
      display: grid;
      place-items: center;
    }
    .image-upload__preview img {
      width: 100%;
      max-height: 220px;
      object-fit: cover;
      display: block;
    }
    .image-upload__placeholder {
      color: color-mix(in srgb, currentColor 55%, transparent);
      font-size: 0.9rem;
      padding: 1rem;
      text-align: center;
    }
    .image-upload__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }
    .image-upload__pick {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      margin: 0;
    }
    .image-upload__pick input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .image-upload__hint {
      color: color-mix(in srgb, currentColor 55%, transparent);
    }
  `,
})
export class ImageUploadComponent {
  private api = inject(UniversityApiService);
  private toast = inject(ToastService);

  @Input() label = 'Image';
  @Input() hint = 'JPEG, PNG, WebP or GIF · max 5 MB';
  @Input() set value(v: string) {
    this._value = v || '';
    this.previewUrl.set(resolveMediaUrl(this._value));
  }
  get value(): string {
    return this._value;
  }

  @Output() valueChange = new EventEmitter<string>();

  private _value = '';
  busy = signal(false);
  previewUrl = signal('');

  async onFile(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning('File too large', 'Maximum size is 5 MB.');
      return;
    }

    this.busy.set(true);
    try {
      const result = await this.api.uploadMedia(file);
      this._value = result.url;
      this.previewUrl.set(resolveMediaUrl(result.url));
      this.valueChange.emit(result.url);
      this.toast.success('Uploaded', file.name);
    } catch {
      this.toast.warning('Upload failed', 'Check API connection and admin login.');
    } finally {
      this.busy.set(false);
    }
  }

  clear(): void {
    this._value = '';
    this.previewUrl.set('');
    this.valueChange.emit('');
  }
}
