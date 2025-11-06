import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: false,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = 'unset';  // Her testten önce body overflow'u sıfırla
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';  // Her testten sonra body overflow'u temizle
  });

  describe('Render', () => {
    it('kapalı olduğunda render edilmemeli', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('açık olduğunda başlık ve içeriği göstermeli', () => {
      render(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });
  });

  describe('Boyut ve Mod', () => {
    it('tüm boyut varyantlarını desteklemeli', () => {
      const { container: sm } = render(<Modal {...defaultProps} isOpen={true} size="sm" />);
      expect(sm.querySelector('.max-w-md')).toBeInTheDocument();

      const { container: md } = render(<Modal {...defaultProps} isOpen={true} size="md" />);
      expect(md.querySelector('.max-w-2xl')).toBeInTheDocument();

      const { container: lg } = render(<Modal {...defaultProps} isOpen={true} size="lg" />);
      expect(lg.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('compact modunda padding azaltılmalı', () => {
      const { container } = render(<Modal {...defaultProps} isOpen={true} compact={true} />);
      expect(container.querySelector('.p-4')).toBeInTheDocument();
    });
  });

  describe('Kapatma Fonksiyonları', () => {
    it('kapat butonu, backdrop ve Escape tuşu ile kapanmalı', () => {
      const onCloseMock = jest.fn();
      const { container } = render(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
      
      // Kapat butonu
      fireEvent.click(screen.getByLabelText('Kapat'));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
      
      onCloseMock.mockClear();
      
      // Backdrop
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) fireEvent.click(backdrop);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
      
      onCloseMock.mockClear();
      
      // Escape tuşu
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('modal içeriğine tıklandığında kapanmamalı', () => {
      const onCloseMock = jest.fn();
      const { container } = render(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
      
      const modalContent = container.querySelector('.bg-white.rounded-lg');
      if (modalContent) fireEvent.click(modalContent);
      
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('Idempotency', () => {
    it('onClose birden fazla kez çağrılabilmeli', () => {
      const onCloseMock = jest.fn();
      render(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
      
      const closeButton = screen.getByLabelText('Kapat');
      // Birden fazla kapatma çağrısı güvenli olmalı
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      expect(onCloseMock).toHaveBeenCalledTimes(3);
    });

    it('hızlı açma/kapama döngülerinde stabil çalışmalı', () => {
      const onCloseMock = jest.fn();
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} onClose={onCloseMock} />);
      
      // Hızlı açma/kapama döngüleri
      for (let i = 0; i < 5; i++) {
        rerender(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
        rerender(<Modal {...defaultProps} isOpen={false} onClose={onCloseMock} />);
      }
      
      // Hata vermemeli ve body overflow sıfırlanmalı
      expect(document.body.style.overflow).toBe('unset');
    });

    it('aynı anda birden fazla kapatma yöntemi kullanıldığında hata vermemeli', () => {
      const onCloseMock = jest.fn();
      render(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
      
      // Eşzamanlı kapatma işlemleri
      fireEvent.click(screen.getByLabelText('Kapat'));
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('Body Overflow Yönetimi', () => {
    it('açıldığında hidden, kapandığında unset olmalı', () => {
      const { rerender, unmount } = render(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('unset');
      
      rerender(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Event Listener Yönetimi', () => {
    it('Escape listener açıldığında eklenmeli, kapandığında kaldırılmalı', () => {
      const onCloseMock = jest.fn();
      const { rerender, unmount } = render(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
      
      // Açıkken Escape çalışmalı
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
      
      onCloseMock.mockClear();
      
      // Kapalıyken Escape çalışmamalı
      rerender(<Modal {...defaultProps} isOpen={false} onClose={onCloseMock} />);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onCloseMock).not.toHaveBeenCalled();
      
      // Unmount sonrası çalışmamalı
      rerender(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
      unmount();
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('boş ve uzun title metinlerini işleyebilmeli', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={true} title="" />);
      expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('');
      
      const longTitle = 'A'.repeat(200);
      rerender(<Modal {...defaultProps} isOpen={true} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('boş ve karmaşık children ile çalışmalı', () => {
      const { container } = render(<Modal {...defaultProps} isOpen={true} children={null} />);
      expect(container.querySelector('.p-6')).toBeInTheDocument();
      
      render(
        <Modal {...defaultProps} isOpen={true}>
          <div>
            <h3>Nested Title</h3>
            <button>Nested Button</button>
          </div>
        </Modal>
      );
      expect(screen.getByText('Nested Title')).toBeInTheDocument();
    });

    it('diğer tuşlara basıldığında kapanmamalı', () => {
      const onCloseMock = jest.fn();
      render(<Modal {...defaultProps} isOpen={true} onClose={onCloseMock} />);
      
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });
      
      expect(onCloseMock).not.toHaveBeenCalled();
    });

    it('modal içindeki form etkileşimleri backdrop\'u tetiklememeli', () => {
      const onCloseMock = jest.fn();
      render(
        <Modal {...defaultProps} isOpen={true} onClose={onCloseMock}>
          <form>
            <input type="text" />
            <button type="submit">Submit</button>
          </form>
        </Modal>
      );
      
      fireEvent.click(screen.getByRole('textbox'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
      
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('Erişilebilirlik', () => {
    it('kapat butonu aria-label ve başlık heading olmalı', () => {
      render(<Modal {...defaultProps} isOpen={true} />);
      expect(screen.getByLabelText('Kapat')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});
