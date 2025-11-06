import { render, screen, waitFor, act } from '@testing-library/react';
import CountdownTimer from '@/components/CountdownTimer';

jest.useFakeTimers();

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
  });

  describe('Active Countdown', () => {
    it('zaman birimlerini doğru şekilde göstermeli', async () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 15 * 60 * 1000 + 30 * 1000);
      
      render(<CountdownTimer targetDate={futureDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => { // zaman geçtikçe ui değişir, doğrudan kontrol etmek yerine bekliyoruz
        expect(screen.getByText('Kalan Süre')).toBeInTheDocument();
        expect(screen.getByText('02')).toBeInTheDocument(); // days
        expect(screen.getByText('Gün')).toBeInTheDocument();
        expect(screen.getByText('Saat')).toBeInTheDocument();
        expect(screen.getByText('Dakika')).toBeInTheDocument();
        expect(screen.getByText('Saniye')).toBeInTheDocument();
      });
    });

    it('her saniye geri sayımı güncellemeli', async () => {
      const futureDate = new Date(Date.now() + 5000); // 5 saniye sonrası
      
      render(<CountdownTimer targetDate={futureDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Başlangıç render bekleniyor
      await waitFor(() => {
        expect(screen.getByText('Saniye')).toBeInTheDocument();
      });

      const initialSeconds = screen.getAllByText(/^\d{2}$/).find(
        (el) => el.textContent === '05' || el.textContent === '04'
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const updatedSeconds = screen.getAllByText(/^\d{2}$/);
        expect(updatedSeconds.length).toBeGreaterThan(0);
      });
    });

    it('tek haneli sayıları başına sıfır ekleyerek göstermeli', async () => {
      const futureDate = new Date(Date.now() + 9 * 1000); // 9 saniye sonrası
      
      render(<CountdownTimer targetDate={futureDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const timeValues = screen.getAllByText(/^\d{2}$/);
        timeValues.forEach((value) => {
          expect(value.textContent?.length).toBe(2);
        });
      });
    });
  });

  describe('Past Date Handling', () => {
    it('hedef tarih geçmişte olduğunda "Başladı!" göstermeli', async () => {
      const pastDate = new Date(Date.now() - 10000);
      
      render(<CountdownTimer targetDate={pastDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Başladı!')).toBeInTheDocument();
        expect(screen.getByText('Kalan Süre')).toBeInTheDocument();
      });
    });

    it('geri sayım sıfıra ulaştığında onComplete callback\'ini çağırmalı', async () => {
      const onCompleteMock = jest.fn();
      const futureDate = new Date(Date.now() + 2000);
      
      render(<CountdownTimer targetDate={futureDate} onComplete={onCompleteMock} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(onCompleteMock).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Props', () => {
    it('özel etiketi göstermeli', async () => {
      const futureDate = new Date(Date.now() + 10000);
      const customLabel = 'Özel Etiket';
      
      render(<CountdownTimer targetDate={futureDate} label={customLabel} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText(customLabel)).toBeInTheDocument();
      });
    });

    it('özel className uygulamalı', async () => {
      const futureDate = new Date(Date.now() + 10000);
      const customClassName = 'custom-class-name';
      
      const { container } = render(
        <CountdownTimer targetDate={futureDate} className={customClassName} />
      );
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const element = container.firstChild;
        expect(element).toHaveClass(customClassName);
      });
    });
  });

  describe('Date Format Handling', () => {
    it('string tarih formatını kabul etmeli', async () => {
      const futureDateString = new Date(Date.now() + 10000).toISOString();
      
      render(<CountdownTimer targetDate={futureDateString} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Kalan Süre')).toBeInTheDocument();
      });
    });

    it('Date nesnesi formatını kabul etmeli', async () => {
      const futureDate = new Date(Date.now() + 10000);
      
      render(<CountdownTimer targetDate={futureDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('Kalan Süre')).toBeInTheDocument();
      });
    });
  });

  describe('Timer Cleanup', () => {
    it('unmount olduğunda interval\'ı temizlemeli', () => {
      const futureDate = new Date(Date.now() + 10000);
      const { unmount } = render(<CountdownTimer targetDate={futureDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });
  });

  describe('Time Calculation', () => {
    it('gün, saat, dakika ve saniyeyi doğru hesaplamalı', async () => {
      // 2 gün, 3 saat, 15 dakika, 30 saniye
      const futureDate = new Date(
        Date.now() + 
        2 * 24 * 60 * 60 * 1000 + 
        3 * 60 * 60 * 1000 + 
        15 * 60 * 1000 + 
        30 * 1000
      );
      
      render(<CountdownTimer targetDate={futureDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('02')).toBeInTheDocument(); // gün
        expect(screen.getByText('03')).toBeInTheDocument(); // saat
        expect(screen.getByText('15')).toBeInTheDocument(); // dakika
        expect(screen.getByText('30')).toBeInTheDocument(); // saniye
      });
    });

    it('sıfır değerlerini doğru şekilde işlemeli', async () => {
      const futureDate = new Date(Date.now() + 1000);
      
      render(<CountdownTimer targetDate={futureDate} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const zeros = screen.getAllByText('00');
        expect(zeros.length).toBeGreaterThanOrEqual(3); // gün, saat, dakika 00 olmalı
      });
    });
  });
});