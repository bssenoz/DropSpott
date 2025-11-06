import request from "supertest";
import express, { Request } from "express";
import { joinWaitlist } from "../../src/controllers/dropsController";
import * as dropHelpers from "../../src/utils/dropHelpers";
import * as priorityUtils from "../../src/utils/priorityScore";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

jest.mock("@prisma/client", () => {
  const mockPrisma: any = {
    $transaction: jest.fn((fn: any) => fn(mockPrisma)),
    waitlistEntry: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock("../../src/utils/dropHelpers");
jest.mock("../../src/utils/priorityScore");

const { PrismaClient } = require("@prisma/client");
const mockPrisma = new PrismaClient();

const app = express();
app.use(express.json());
// Test için userId'yi header'dan al
app.use((req: Request, res, next) => {
  req.userId = req.headers["userid"] as string;
  next();
});
app.post("/drops/:id/join", (req, res, next) => joinWaitlist(req, res, next));

describe("POST /drops/:id/join (Integration)", () => {
  const mockDrop = {
    id: "drop123",
    claimWindowStart: new Date(Date.now() - 1000),
    claimWindowEnd: new Date(Date.now() + 1000 * 60 * 10),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("kullanıcının waitlist'e başarıyla katılmasına izin vermeli", async () => {
    (dropHelpers.requireAuth as jest.Mock).mockImplementation(() => true);
    (dropHelpers.findDropById as jest.Mock).mockResolvedValue(mockDrop);
    (dropHelpers.isClaimWindowClosed as jest.Mock).mockReturnValue(false);
    (dropHelpers.findWaitlistEntry as jest.Mock).mockResolvedValue(null);
    (priorityUtils.calculatePriorityScore as jest.Mock).mockResolvedValue(42);
    (dropHelpers.recalculateWaitlistPositions as jest.Mock).mockResolvedValue(undefined);

    const mockWaitlistEntry = {
      id: "entry1",
      userId: "user123",
      dropId: "drop123",
      position: 1,
      priorityScore: 42,
    };

    mockPrisma.waitlistEntry.create.mockResolvedValue(mockWaitlistEntry);
    mockPrisma.waitlistEntry.findUnique.mockResolvedValue(mockWaitlistEntry);

    const response = await request(app)
      .post("/drops/drop123/join")
      .set("Content-Type", "application/json")
      .set("userid", "user123")
      .send({});

    // testler
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Waitlist'e başarıyla katıldınız.");
    expect(response.body.entry.priorityScore).toBe(42);
    expect(dropHelpers.findDropById).toHaveBeenCalledWith("drop123", expect.anything());
    expect(priorityUtils.calculatePriorityScore).toHaveBeenCalledWith("user123", "drop123", expect.any(Date));
  });

  it("kullanıcı authenticated değilse 401 döndürmeli", async () => {
    (dropHelpers.requireAuth as jest.Mock).mockImplementation(() => {
      throw new Error("UNAUTHORIZED");
    });

    const response = await request(app)
      .post("/drops/drop123/join")
      .send({});

    expect(response.status).toBe(401);
  });
});
