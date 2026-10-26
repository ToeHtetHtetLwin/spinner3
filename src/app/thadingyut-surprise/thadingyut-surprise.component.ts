import { Component, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

interface Prize {
  text: string;
  color: string;
}

@Component({
  selector: 'app-thadingyut-surprise',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './thadingyut-surprise.component.html',
  styleUrls: ['./thadingyut-surprise.component.css']
})
export class ThadingyutSurpriseComponent implements AfterViewInit {
  @ViewChild('wheelCanvas') wheelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('kissContainer') kissContainer!: ElementRef<HTMLDivElement>;

  step = signal<number>(1);
  spinsLeft = signal<number>(4);
  isSpinning = signal<boolean>(false);
  showErrorBox = signal<boolean>(false);

  displayPrizeDialog = signal<boolean>(false);
  wonPrizeText = signal<string>('');

  introGif = signal<string>(
    'intro.webp'
  );
  sadGif = 'sad.gif';

  // Wheel background segments display
  wheelDisplayPrizes: Prize[] = [
    { text: '🥰 1', color: '#E63946' },
    { text: '😘 2', color: '#2A9D8F' },
    { text: '😍 3', color: '#E9C46A' },
    { text: '🥳 4', color: '#264653' }
   
  ];

  // Actual Prizes to be won sequentially
  actualPrizes: string[] = [
    'မုန့်ဖိုး 5 သောင်း ',
    'နှုတ်ခမ်းနီ',
    'မုန့်',

    'အာဘွား',

  ];

  private currentRotation = 0;
  private currentSpinCount = 0;

  ngAfterViewInit(): void {
    if (this.step() === 2) {
      this.drawWheel();
    }
  }

  handleNoClick(): void {
    this.introGif.set(this.sadGif);
    this.showErrorBox.set(true);
  }

  goToWheel(): void {
    gsap.to('#intro-card', {
      scale: 0,
      duration: 0.5,
      onComplete: () => {
        this.step.set(2);
        setTimeout(() => this.drawWheel(), 50);
      }
    });
  }

  drawWheel(): void {
    if (!this.wheelCanvas) return;
    const ctx = this.wheelCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const numPrizes = this.wheelDisplayPrizes.length;
    const arc = (2 * Math.PI) / numPrizes;

    ctx.clearRect(0, 0, 320, 320);

    this.wheelDisplayPrizes.forEach((prize, index) => {
      const angle = index * arc;

      // Draw Pie Slice
      ctx.beginPath();
      ctx.fillStyle = prize.color;
      ctx.moveTo(160, 160);
      ctx.arc(160, 160, 155, angle, angle + arc);
      ctx.lineTo(160, 160);
      ctx.fill();

      // White Divider Line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.translate(
        160 + Math.cos(angle + arc / 2) * 105,
        160 + Math.sin(angle + arc / 2) * 105
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      ctx.fillText(prize.text, -ctx.measureText(prize.text).width / 2, 0);
      ctx.restore();
    });
  }

  spinWheel(): void {
    if (this.spinsLeft() <= 0 || this.isSpinning()) return;

    this.isSpinning.set(true);
    this.spinsLeft.update((val) => val - 1);

    // Get current prize in sequence
    const selectedIndex = this.currentSpinCount % this.actualPrizes.length;
    const wonText = this.actualPrizes[selectedIndex];
    this.currentSpinCount++;

    const numPrizes = this.wheelDisplayPrizes.length;
    const sliceAngle = 360 / numPrizes;

    // Calculate rotation to stop exactly at target slice pointer (270deg top pointer)
    const targetSliceCenter = (selectedIndex * sliceAngle) + (sliceAngle / 2);
    const stopAngle = 270 - targetSliceCenter;

    const extraRounds = 360 * 5;
    const currentModulo = this.currentRotation % 360;
    let distanceToStop = (stopAngle - currentModulo) % 360;
    if (distanceToStop < 0) distanceToStop += 360;

    this.currentRotation += extraRounds + distanceToStop;

    gsap.to(this.wheelCanvas.nativeElement, {
      rotation: this.currentRotation,
      duration: 4,
      ease: 'power4.out',
      onComplete: () => {
        this.isSpinning.set(false);
        this.wonPrizeText.set(wonText);

        // Show PrimeNG Dialog Box
        this.displayPrizeDialog.set(true);

        // Fire Confetti Cannon
        this.triggerConfetti();

        // Trigger kiss animation if prize includes 'အာဘွား'
        if (wonText.includes('အာဘွား')) {
          this.triggerKissEffect();
        }
      }
    });
  }

  closeDialog(): void {
    this.displayPrizeDialog.set(false);
  }

  triggerConfetti(): void {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 }
    });

    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 }
    });
  }

  triggerKissEffect(): void {
    const container = this.kissContainer?.nativeElement;
    if (!container) return;
    const emojis = ['💋', '😘', '💖', '🥰', '👄'];

    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      el.className = 'floating-emoji';
      el.style.position = 'fixed';
      el.style.zIndex = '1000';
      el.style.left = `${Math.random() * 100}vw`;
      el.style.bottom = '-50px';
      el.style.fontSize = '24px';
      container.appendChild(el);

      gsap.to(el, {
        y: -window.innerHeight - 100,
        x: (Math.random() - 0.5) * 200,
        rotation: (Math.random() - 0.5) * 360,
        duration: 2 + Math.random() * 2,
        ease: 'power1.out',
        onComplete: () => el.remove()
      });
    }
  }
}