import { Component, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

interface Prize {
  text: string;
  color: string;
  emoji: string;
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
  spinsLeft = signal<number>(5);
  isSpinning = signal<boolean>(false);
  showErrorBox = signal<boolean>(false);

  displayPrizeDialog = signal<boolean>(false);
  wonPrizeText = signal<string>('');
  wonPrizeEmoji = signal<string>('');

  introGif = signal<string>('intro.webp');
  sadGif = 'sad.gif';

  // Wheel ပေါ်တွင် ပြသမည့် ဆုမဲ ၅ မျိုး
  prizes: Prize[] = [
    { text: 'မုန့်', color: '#E63946', emoji: '🍩' },
    { text: 'နှုတ်ခမ်းနီ', color: '#2A9D8F', emoji: '💄' },
    { text: 'အာဘွား', color: '#E9C46A', emoji: '💋' },
    { text: 'ဗလာ', color: '#264653', emoji: '😢' },
    { text: 'မုန့်ဖိုး 5 သောင်း', color: '#F4A261', emoji: '💵' }
  ];

  // မဲပေါက်မည့် အစဉ်လိုက် (၅ သောင်းဆုကို နောက်ဆုံးမှ ပေါက်ပါမည်)
  // ၁. ဗလာ -> ၂. မုန့် -> ၃. နှုတ်ခမ်းနီ -> ၄. အာဘွား -> ၅. မုန့်ဖိုး 5 သောင်း
  actualSequenceIndexes: number[] = [3, 0, 1, 2, 4];

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

    const numPrizes = this.prizes.length;
    const arc = (2 * Math.PI) / numPrizes;

    ctx.clearRect(0, 0, 320, 320);

    this.prizes.forEach((prize, index) => {
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

      // Draw Text & Emoji
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.translate(
        160 + Math.cos(angle + arc / 2) * 105,
        160 + Math.sin(angle + arc / 2) * 105
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      const label = `${prize.emoji} ${prize.text}`;
      ctx.fillText(label, -ctx.measureText(label).width / 2, 0);
      ctx.restore();
    });
  }

  spinWheel(): void {
    if (this.spinsLeft() <= 0 || this.isSpinning()) return;

    this.isSpinning.set(true);
    this.spinsLeft.update((val) => val - 1);

    // ရွေးချယ်မည့် Target Index ကို အစဉ်လိုက် ထုတ်ယူခြင်း
    const targetPrizeIndex = this.actualSequenceIndexes[this.currentSpinCount % this.actualSequenceIndexes.length];
    const targetPrize = this.prizes[targetPrizeIndex];
    this.currentSpinCount++;

    const numPrizes = this.prizes.length;
    const sliceAngle = 360 / numPrizes;

    // အပေါ်ဘက် Pointer (270 degree) နေရာသို့ ရောက်အောင် ပတ်လည်အရှီး တွက်ချက်ခြင်း
    const targetSliceCenter = (targetPrizeIndex * sliceAngle) + (sliceAngle / 2);
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
        this.wonPrizeText.set(targetPrize.text);
        this.wonPrizeEmoji.set(targetPrize.emoji);

        // Show Dialog
        this.displayPrizeDialog.set(true);

        // Confetti effect
        this.triggerConfetti();

        // Trigger Kiss Effect if 'အာဘွား'
        if (targetPrize.text.includes('အာဘွား')) {
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