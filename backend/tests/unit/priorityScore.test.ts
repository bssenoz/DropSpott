const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    drop: {
      findUnique: jest.fn(),
    },
    waitlistEntry: {
      count: jest.fn(),
    },
    claimCode: {
      count: jest.fn(),
    },
  };
  
  jest.mock('@prisma/client', () => {
    return {
      PrismaClient: jest.fn(() => mockPrisma),
    };
  });
  
  import { calculatePriorityScore } from "../../src/utils/priorityScore";
  
  describe("calculatePriorityScore", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("deterministik bir priority score döndürmeli", async () => {
      const mockUser = {
        id: "user123",
        createdAt: new Date("2025-01-01T00:00:00Z"),
      };
  
      const mockDrop = {
        id: "drop456",
        createdAt: new Date("2025-01-15T00:00:00Z"),
      };
  
      const joinTime = new Date("2025-01-20T12:00:00Z");
  
      //nher çağrı için aynı değerleri döndürmeli
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.drop.findUnique.mockResolvedValue(mockDrop);
      mockPrisma.waitlistEntry.count.mockResolvedValue(0);
      mockPrisma.claimCode.count.mockResolvedValue(0);
  
      const result1 = await calculatePriorityScore("user123", "drop456", joinTime);
      const result2 = await calculatePriorityScore("user123", "drop456", joinTime);
  
      expect(typeof result1).toBe("number");
      expect(result1).toBeGreaterThan(0);
      expect(result1).toBe(result2); // aynı girdiler => aynı sonuç
    });
  
    it("kullanıcı bulunamazsa hata fırlatmalı", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        calculatePriorityScore("missingUser", "drop456", new Date())
      ).rejects.toThrow("User not found");
    });
  
    it("drop bulunamazsa hata fırlatmalı", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "user123" });
      mockPrisma.drop.findUnique.mockResolvedValueOnce(null);
      await expect(
        calculatePriorityScore("user123", "missingDrop", new Date())
      ).rejects.toThrow("Drop not found");
    });
  });