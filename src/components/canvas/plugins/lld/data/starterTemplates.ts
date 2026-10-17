import { 
  generateClassNode, generateInterfaceNode, generateNoteNode,
  generateActorNode, generateLifelineNode, generateActivationNode,
  generateInitialNode, generateFinalNode, generateActionNode,
  generateComponentNode, generateDeviceNode, generateArtifactNode,
  generatePackageNode
} from '../nodes/generators';
import { createArrow } from '../utils/elementGenerator';

// Easy 1: Parking Lot
const getParkingLotTemplate = () => {
  const elements: any[] = [];
  const note = generateNoteNode(50, 50, "Design parking spots\nand pricing strategy.");
  elements.push(...note);
  
  elements.push(...generateClassNode(300, 50, "ParkingLot", 
    ["- floors: List<ParkingFloor>", "- entryPanels: List<EntryPanel>", "- exitPanels: List<ExitPanel>"], 
    ["+ getNewParkingTicket(): Ticket", "+ isFull(): boolean", "+ addFloor(floor: ParkingFloor): void"]
  ));
  
  elements.push(...generateClassNode(300, 350, "ParkingSpot", 
    ["- spotId: string", "- isFree: boolean", "- type: VehicleType"], 
    ["+ assignVehicle(vehicle: Vehicle): void", "+ removeVehicle(): void", "+ isFree(): boolean"]
  ));
  
  elements.push(...generateInterfaceNode(750, 50, "IPricingStrategy", 
    ["+ calculatePrice(ticket: Ticket): double"]
  )); 
  
  elements.push(...generateClassNode(750, 350, "HourlyPricing", 
    ["- hourlyRate: double"], 
    ["+ calculatePrice(ticket: Ticket): double"]
  ));
  
  elements.push(createArrow(400, 240, [[0, 0], [0, 110]], { strokeStyle: "solid", startArrowhead: "diamond", endArrowhead: null }));
  elements.push(createArrow(850, 350, [[0, 0], [0, -150]], { strokeStyle: "dashed", endArrowhead: "triangle_outline" }));
  elements.push(createArrow(560, 120, [[0, 0], [190, 0]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  return elements;
};

// Easy 2: Library Management
const getLibraryTemplate = () => {
  const elements: any[] = [];
  const note = generateNoteNode(50, 50, "Track book copies\nseparately from definition.");
  elements.push(...note);

  elements.push(...generateClassNode(300, 50, "Library", ["- name", "- address"], ["+ searchBook()", "+ registerMember()"]));
  elements.push(...generateClassNode(650, 50, "Book", ["- ISBN", "- title", "- author", "- subject"], []));
  elements.push(...generateClassNode(650, 300, "BookItem", ["- barcode", "- isReference", "- price", "- status", "- dueDate"], ["+ checkout()", "+ returnBook()"]));
  elements.push(...generateClassNode(300, 300, "Member", ["- totalBooksCheckedOut"], ["+ reserveBookItem()", "+ checkoutBookItem()", "+ returnBookItem()"]));
  
  elements.push(createArrow(600, 120, [[0, 0], [-100, 0]], { strokeStyle: "solid", startArrowhead: "diamond", endArrowhead: null }));
  elements.push(createArrow(750, 150, [[0, 0], [0, 150]], { strokeStyle: "solid", startArrowhead: "diamond", endArrowhead: null }));
  elements.push(createArrow(450, 350, [[0, 0], [200, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  return elements;
};

// Easy 3: ATM
const getAtmTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Use State Pattern\nfor ATM states."));
  
  elements.push(...generateInitialNode(200, 150));
  elements.push(...generateActionNode(350, 130, "IdleState"));
  elements.push(...generateActionNode(650, 130, "HasCardState"));
  elements.push(...generateActionNode(650, 350, "SelectOperationState"));
  elements.push(...generateActionNode(350, 350, "DispenseCashState"));
  
  elements.push(createArrow(230, 160, [[0, 0], [120, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(510, 160, [[0, 0], [140, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(730, 210, [[0, 0], [0, 140]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(650, 390, [[0, 0], [-140, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(430, 350, [[0, 0], [0, -140]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  
  return elements;
};

// Easy 4: Elevator System
const getElevatorTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Elevator states:\nMoving, Stopped, Idle"));
  
  elements.push(...generateActionNode(300, 100, "Idle"));
  elements.push(...generateActionNode(600, 100, "MovingUp"));
  elements.push(...generateActionNode(600, 300, "MovingDown"));
  elements.push(...generateActionNode(300, 300, "DoorsOpen"));
  
  elements.push(createArrow(460, 140, [[0, 0], [140, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(680, 180, [[0, 0], [0, 120]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(600, 340, [[0, 0], [-140, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(380, 300, [[0, 0], [0, -120]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  return elements;
};

// Easy 5: Snake & Ladder
const getSnakeLadderTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Separate Game, Board,\nand Players."));
  
  elements.push(...generateClassNode(300, 100, "Game", ["- board: Board", "- players: Queue<Player>"], ["+ launch()", "+ rollDice()"]));
  elements.push(...generateClassNode(650, 100, "Board", ["- cells: Cell[]"], ["+ getCell(pos): Cell"]));
  elements.push(...generateClassNode(300, 350, "Player", ["- id", "- name", "- currentPosition"], ["+ move(steps: int)"]));
  elements.push(...generateClassNode(650, 350, "Cell", ["- id", "- jump: Jump"], []));
  
  elements.push(createArrow(460, 140, [[0, 0], [190, 0]], { strokeStyle: "solid", startArrowhead: "diamond_outline", endArrowhead: null }));
  elements.push(createArrow(400, 200, [[0, 0], [0, 150]], { strokeStyle: "solid", startArrowhead: "diamond_outline", endArrowhead: null }));
  elements.push(createArrow(750, 200, [[0, 0], [0, 150]], { strokeStyle: "solid", startArrowhead: "diamond_outline", endArrowhead: null }));
  return elements;
};

// Easy 6: Tic Tac Toe
const getTicTacToeTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Grid size is strictly 3x3."));
  
  elements.push(...generateClassNode(300, 100, "TicTacToeGame", ["- board: Board", "- players: Player[2]"], ["+ play()"]));
  elements.push(...generateClassNode(650, 100, "Board", ["- grid: PieceType[][]"], ["+ makeMove(r, c, piece)"]));
  elements.push(...generateClassNode(300, 350, "Player", ["- name", "- piece: PieceType"], []));
  
  elements.push(createArrow(500, 140, [[0, 0], [150, 0]], { strokeStyle: "solid", startArrowhead: "diamond", endArrowhead: null }));
  elements.push(createArrow(400, 200, [[0, 0], [0, 150]], { strokeStyle: "solid", startArrowhead: "diamond", endArrowhead: null }));
  return elements;
};

// Medium 1: Splitwise
const getSplitwiseTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Think about Graph\nalgorithms for debts."));
  
  elements.push(...generateClassNode(300, 100, "User", ["- id: string", "- name: string", "- email: string", "- phone: string"], ["+ updateProfile(name: string): void", "+ getDetails(): User"]));
  elements.push(...generateClassNode(700, 100, "Expense", ["- id: string", "- amount: double", "- paidBy: User", "- splits: List<Split>"], ["+ calculateSplits(): void", "+ isValid(): boolean"]));
  elements.push(...generateClassNode(300, 400, "Group", ["- id: string", "- name: string", "- members: List<User>", "- expenses: List<Expense>"], ["+ addMember(user: User): void", "+ addExpense(expense: Expense): void"]));
  
  elements.push(createArrow(400, 400, [[0, 0], [0, -150]], { strokeStyle: "solid", startArrowhead: "diamond_outline", endArrowhead: null }));
  elements.push(createArrow(700, 160, [[0, 0], [-250, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  return elements;
};

// Medium 2: BookMyShow
const getBookMyShowTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Consider pessimistic\nlocking for seats."));
  
  elements.push(...generateActorNode(100, 100, "User"));
  elements.push(...generateLifelineNode(150, 180));
  
  elements.push(...generateClassNode(350, 100, "API Gateway", [], []));
  elements.push(...generateLifelineNode(450, 180));
  
  elements.push(...generateClassNode(650, 100, "Booking Service", [], []));
  elements.push(...generateLifelineNode(750, 180));
  
  elements.push(createArrow(150, 220, [[0, 0], [300, 0]], { strokeStyle: "solid", endArrowhead: "triangle" }));
  elements.push(createArrow(450, 260, [[0, 0], [300, 0]], { strokeStyle: "solid", endArrowhead: "triangle" }));
  return elements;
};

// Medium 3: Amazon Locker
const getAmazonLockerTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "State pattern for\nlocker states."));
  
  elements.push(...generateActionNode(300, 100, "LockerAvailable"));
  elements.push(...generateActionNode(600, 100, "LockerBooked"));
  elements.push(...generateActionNode(600, 300, "LockerFilled"));
  
  elements.push(createArrow(460, 140, [[0, 0], [140, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(680, 180, [[0, 0], [0, 120]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(600, 340, [[0, 0], [-220, -160]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  return elements;
};

// Medium 4: Food Delivery
const getFoodDeliveryTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Observer pattern for\nstatus updates."));
  
  elements.push(...generateActorNode(100, 100, "Customer"));
  elements.push(...generateLifelineNode(150, 180));
  
  elements.push(...generateClassNode(350, 100, "Order Service", [], []));
  elements.push(...generateLifelineNode(450, 180));
  
  elements.push(...generateActorNode(650, 100, "Restaurant"));
  elements.push(...generateLifelineNode(700, 180));
  
  elements.push(createArrow(150, 220, [[0, 0], [300, 0]], { strokeStyle: "solid", endArrowhead: "triangle" }));
  elements.push(createArrow(450, 260, [[0, 0], [250, 0]], { strokeStyle: "solid", endArrowhead: "triangle" }));
  elements.push(createArrow(700, 300, [[0, 0], [-250, 0]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  return elements;
};

// Medium 5: Coffee Machine
const getCoffeeMachineTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Decorator pattern for\ncondiments."));
  
  elements.push(...generateInterfaceNode(350, 50, "ICoffee", ["+ getCost(): double", "+ getDescription(): String"]));
  elements.push(...generateClassNode(150, 250, "Espresso", ["- cost"], ["+ getCost()", "+ getDescription()"]));
  elements.push(...generateClassNode(550, 250, "CoffeeDecorator", ["- wrappedCoffee: ICoffee"], ["+ getCost()", "+ getDescription()"], "abstract", true));
  elements.push(...generateClassNode(550, 450, "MilkDecorator", ["- cost"], ["+ getCost()", "+ getDescription()"]));
  
  elements.push(createArrow(250, 250, [[0, 0], [100, -100]], { strokeStyle: "dashed", endArrowhead: "triangle_outline" }));
  elements.push(createArrow(650, 250, [[0, 0], [-100, -100]], { strokeStyle: "dashed", endArrowhead: "triangle_outline" }));
  elements.push(createArrow(650, 450, [[0, 0], [0, -100]], { strokeStyle: "solid", endArrowhead: "triangle_outline" }));
  elements.push(createArrow(750, 290, [[0, 0], [60, 0], [60, -220], [-250, -220]], { strokeStyle: "solid", startArrowhead: "diamond_outline", endArrowhead: null }));
  return elements;
};

// Medium 6: Hotel Booking
const getHotelBookingTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Concurrency control\nis essential."));
  
  elements.push(...generateActorNode(100, 100, "User"));
  elements.push(...generateLifelineNode(150, 180));
  
  elements.push(...generateClassNode(350, 100, "Search Service", [], []));
  elements.push(...generateLifelineNode(450, 180));
  
  elements.push(...generateClassNode(650, 100, "Booking Service", [], []));
  elements.push(...generateLifelineNode(750, 180));
  
  elements.push(createArrow(150, 220, [[0, 0], [300, 0]], { strokeStyle: "solid", endArrowhead: "triangle" })); 
  elements.push(createArrow(450, 260, [[0, 0], [-300, 0]], { strokeStyle: "dashed", endArrowhead: "arrow" })); 
  elements.push(createArrow(150, 300, [[0, 0], [600, 0]], { strokeStyle: "solid", endArrowhead: "triangle" })); 
  return elements;
};

// Hard 1: WhatsApp (Deployment)
const getWhatsAppTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "WebSockets for\nreal-time delivery."));
  
  elements.push(...generateDeviceNode(300, 100, "Client Mobile"));
  elements.push(...generateArtifactNode(330, 200, "WhatsApp App"));
  
  elements.push(...generateDeviceNode(700, 100, "Chat Server"));
  elements.push(...generateArtifactNode(730, 200, "WebSocket Handler"));
  
  elements.push(createArrow(520, 180, [[0, 0], [180, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  return elements;
};

// Hard 2: Google Docs (Sequence)
const getGoogleDocsTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "CRDT or OT for\nconflict resolution."));
  
  elements.push(...generateActorNode(100, 100, "User A"));
  elements.push(...generateLifelineNode(150, 180));
  
  elements.push(...generateActorNode(300, 100, "User B"));
  elements.push(...generateLifelineNode(350, 180));
  
  elements.push(...generateClassNode(550, 100, "Sync Server", [], []));
  elements.push(...generateLifelineNode(650, 180));
  
  elements.push(createArrow(150, 220, [[0, 0], [500, 0]], { strokeStyle: "solid", endArrowhead: "triangle" }));
  elements.push(createArrow(350, 260, [[0, 0], [300, 0]], { strokeStyle: "solid", endArrowhead: "triangle" }));
  elements.push(createArrow(650, 300, [[0, 0], [-500, 0]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  return elements;
};

// Hard 3: Uber (Component)
const getUberTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Geospatial Indexing\nfor location."));
  
  elements.push(...generateComponentNode(300, 100, "API Gateway"));
  elements.push(...generateComponentNode(650, 100, "Matchmaking Service"));
  elements.push(...generateComponentNode(300, 350, "Location Service"));
  elements.push(...generateComponentNode(650, 350, "Trip Service"));
  
  elements.push(createArrow(480, 140, [[0, 0], [150, 0]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  elements.push(createArrow(380, 200, [[0, 0], [0, 130]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  elements.push(createArrow(730, 200, [[0, 0], [0, 130]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  return elements;
};

// Hard 4: Netflix (Component)
const getNetflixTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "CDNs are central\nto this design."));
  
  elements.push(...generateComponentNode(300, 100, "Web App"));
  elements.push(...generateComponentNode(650, 100, "API Gateway"));
  elements.push(...generateComponentNode(300, 350, "Recommendation Service"));
  elements.push(...generateComponentNode(650, 350, "CDN (Video Streaming)"));
  
  elements.push(createArrow(480, 140, [[0, 0], [150, 0]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  elements.push(createArrow(380, 200, [[0, 0], [0, 130]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  elements.push(createArrow(650, 140, [[0, 0], [-170, 0], [-170, 210]], { strokeStyle: "dashed", endArrowhead: "arrow" }));
  return elements;
};

// Hard 5: Spotify (Deployment)
const getSpotifyTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(50, 50, "Chunking audio\nfiles for streaming."));
  
  elements.push(...generateDeviceNode(150, 100, "User Mobile"));
  elements.push(...generateArtifactNode(180, 200, "Spotify App"));
  
  elements.push(...generateDeviceNode(500, 100, "API Server"));
  elements.push(...generateArtifactNode(530, 200, "Catalog Service"));
  
  elements.push(...generateDeviceNode(850, 100, "CDN Node"));
  elements.push(...generateArtifactNode(880, 200, "Audio Chunks"));
  
  elements.push(createArrow(370, 180, [[0, 0], [130, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  elements.push(createArrow(370, 200, [[0, 0], [480, 0]], { strokeStyle: "solid", endArrowhead: "arrow" }));
  return elements;
};

// Default
const getDefaultTemplate = () => {
  const elements: any[] = [];
  elements.push(...generateNoteNode(100, 100, "Start your architecture\ndesign here..."));
  return elements;
};

export const starterTemplates: Record<string, any[]> = {
  'q-easy-1': getParkingLotTemplate(),
  'q-easy-2': getLibraryTemplate(),
  'q-easy-3': getAtmTemplate(),
  'q-easy-4': getElevatorTemplate(),
  'q-easy-5': getSnakeLadderTemplate(),
  'q-easy-6': getTicTacToeTemplate(),
  'q-medium-1': getSplitwiseTemplate(),
  'q-medium-2': getBookMyShowTemplate(),
  'q-medium-3': getAmazonLockerTemplate(),
  'q-medium-4': getFoodDeliveryTemplate(),
  'q-medium-5': getCoffeeMachineTemplate(),
  'q-medium-6': getHotelBookingTemplate(),
  'q-hard-1': getWhatsAppTemplate(),
  'q-hard-2': getGoogleDocsTemplate(),
  'q-hard-3': getUberTemplate(),
  'q-hard-4': getNetflixTemplate(),
  'q-hard-5': getSpotifyTemplate(),
  'default': getDefaultTemplate()
};
