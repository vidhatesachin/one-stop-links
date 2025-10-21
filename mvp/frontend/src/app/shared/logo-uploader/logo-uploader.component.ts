import { Component, EventEmitter, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { UploadService } from '../../core/services/upload.service';

@Component({
  selector: 'app-logo-uploader',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  template: `
    <div class="logo-uploader">
      <!-- File Input -->
      <div class="mb-4" *ngIf="!imageChangedEvent">
        <label
          class="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div class="flex flex-col items-center">
            <svg
              class="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="text-gray-600 font-medium">Click to select logo</span>
            <span class="text-sm text-gray-500 mt-1"
              >JPG, PNG, GIF (Max 1MB)</span
            >
          </div>
          <input
            type="file"
            class="hidden"
            accept="image/*"
            (change)="onFileSelected($event)"
          />
        </label>
      </div>

      <!-- Image Cropper -->
      <div *ngIf="imageChangedEvent && !uploading" class="cropper-container">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Crop Your Logo
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Adjust the image to fit perfectly. Recommended: Square aspect ratio
          </p>

          <div class="cropper-wrapper bg-gray-100 rounded-lg p-4">
            <image-cropper
              #imageCropper
              [imageChangedEvent]="imageChangedEvent"
              [maintainAspectRatio]="true"
              [aspectRatio]="1 / 1"
              [resizeToWidth]="400"
              [cropperMinWidth]="50"
              format="png"
              output="base64"
              [imageQuality]="85"
              [autoCrop]="true"
              [alignImage]="'center'"
              [style.display]="'block'"
              [style.width]="'100%'"
              (imageCropped)="imageCropped($event)"
              (imageLoaded)="imageLoaded()"
              (cropperReady)="cropperReady()"
              (loadImageFailed)="loadImageFailed()"
            ></image-cropper>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-4">
          <button
            type="button"
            (click)="cancelCrop()"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="uploadCroppedImage()"
            [disabled]="uploading"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
          >
            Upload Logo
          </button>
        </div>
        
        <p class="text-xs text-gray-500 mt-3 text-center">
          Adjust the crop area above, then click "Upload Logo" when ready
        </p>
      </div>

      <!-- Uploading State -->
      <div *ngIf="uploading" class="text-center py-8">
        <div
          class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-gray-600 font-medium">Uploading your logo...</p>
        <p class="text-sm text-gray-500 mt-1">
          Optimizing and storing securely
        </p>
      </div>

      <!-- Error Message -->
      <div
        *ngIf="errorMessage"
        class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
      >
        <p class="text-sm text-red-600">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .logo-uploader {
        width: 100%;
      }

      .cropper-wrapper {
        width: 100%;
        max-width: 500px;
        height: auto;
        min-height: 300px;
        position: relative;
        overflow: visible;
        display: block;
        margin: 0 auto;
      }

      ::ng-deep .cropper-wrapper image-cropper {
        display: block !important;
        width: 100% !important;
        height: auto !important;
      }

      ::ng-deep image-cropper {
        max-width: 500px !important;
      }

      ::ng-deep image-cropper > div {
        width: 100% !important;
        height: auto !important;
        position: relative !important;
      }

      ::ng-deep image-cropper img.source-image {
        max-width: 100% !important;
        width: 100% !important;
        height: auto !important;
        display: block !important;
      }

      ::ng-deep .ngx-ic-source-image {
        max-width: 100% !important;
        height: auto !important;
      }

      ::ng-deep .cropper-wrapper .ngx-ic-move {
        cursor: move !important;
      }

      ::ng-deep .cropper-wrapper .ngx-ic-resize {
        cursor: nwse-resize !important;
      }

      ::ng-deep .cropper-wrapper .ngx-ic-overlay {
        border-radius: 8px;
      }
    `,
  ],
})
export class LogoUploaderComponent {
  @Output() logoUploaded = new EventEmitter<string>();
  @Output() uploadCancelled = new EventEmitter<void>();
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;

  imageChangedEvent: Event | null = null;
  croppedImage: string = '';
  uploading = false;
  errorMessage = '';
  imageLoaded_flag = false;

  constructor(
    private uploadService: UploadService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file';
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      this.errorMessage = 'Image file size should be less than 1MB. Please compress your image.';
      input.value = '';
      return;
    }

    this.errorMessage = '';
    this.croppedImage = ''; // Reset cropped image
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (event.base64) {
      this.croppedImage = event.base64;
      console.log('✓ Image cropped event fired, size:', this.croppedImage.length);
      this.cdr.detectChanges();
    }
  }

  imageLoaded(): void {
    this.imageLoaded_flag = true;
    console.log('✓ Image loaded into cropper');
    // Trigger change detection
    this.cdr.detectChanges();
  }

  cropperReady(): void {
    console.log('✓ Cropper ready');
  }

  loadImageFailed(): void {
    this.errorMessage = 'Failed to load image. Please try another file.';
    this.cancelCrop();
  }

  cancelCrop(): void {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.errorMessage = '';
    this.uploadCancelled.emit();
  }

  uploadCroppedImage(): void {
    console.log('Upload clicked. Cropped image available:', !!this.croppedImage, 'Image loaded:', this.imageLoaded_flag);
    
    // If croppedImage is not set, try to get it directly from the cropper
    if (!this.croppedImage && this.imageLoaded_flag && this.imageCropper) {
      console.log('⚠️ imageCropped event did not fire, attempting to extract image...');
      
      // Try to access the cropper's internal cropped canvas/image
      try {
        // Force the cropper to emit the event
        if (typeof this.imageCropper.crop === 'function') {
          this.imageCropper.crop('base64');
        }
        
        // Give it a moment and check again
        setTimeout(() => {
          if (this.croppedImage) {
            console.log('✓ Successfully extracted cropped image');
            this.proceedWithUpload();
          } else {
            // Last resort: try to get the image from the cropper directly
            console.log('Attempting direct access to cropper data...');
            const cropperAny = this.imageCropper as any;
            if (cropperAny.croppedImage) {
              this.croppedImage = cropperAny.croppedImage;
              console.log('✓ Got image from cropper.croppedImage property');
              this.proceedWithUpload();
            } else {
              this.errorMessage = 'Unable to process the cropped image. Please try:\n1. Slightly adjust the crop area\n2. Select a different image\n3. Refresh the page';
              console.error('All attempts to get cropped image failed. Cropper state:', cropperAny);
            }
          }
        }, 200);
        return;
      } catch (error) {
        console.error('Error extracting cropped image:', error);
        this.errorMessage = 'An error occurred processing the image. Please try again.';
        return;
      }
    }

    // Check if cropped image is available
    if (!this.croppedImage) {
      this.errorMessage = 'Please wait for the image to finish loading.';
      console.warn('Upload attempted but no cropped image available. Image loaded:', this.imageLoaded_flag);
      return;
    }

    this.proceedWithUpload();
  }

  private proceedWithUpload(): void {
    this.uploading = true;
    this.errorMessage = '';
    console.log('Starting upload, image size:', this.croppedImage.length);

    this.uploadService.uploadLogo(this.croppedImage).subscribe({
      next: (response) => {
        this.uploading = false;
        if (response.success) {
          console.log('Upload successful:', response.url);
          this.logoUploaded.emit(response.url);
          this.resetUploader();
        } else {
          this.errorMessage = 'Upload failed. Please try again.';
        }
      },
      error: (error) => {
        this.uploading = false;
        console.error('Upload error:', error);
        this.errorMessage =
          error.error?.message || 'Failed to upload logo. Please try again.';
      },
    });
  }

  private resetUploader(): void {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.errorMessage = '';
  }
}
