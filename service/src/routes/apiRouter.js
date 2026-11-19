import { stateController } from '../controllers/stateController.js';
import { ordersController } from '../controllers/ordersController.js';
import { tablesController } from '../controllers/tablesController.js';
import { menuController } from '../controllers/menuController.js';
import { sendJSON } from '../middleware/errorHandler.js';

export async function handleApiRoute(pathname, method, req, res) {
  // State routes
  if (pathname === '/api/state' && method === 'GET') {
    return stateController.getState(req, res);
  }
  if (pathname === '/api/speed' && method === 'POST') {
    return stateController.setSpeed(req, res);
  }
  if (pathname === '/api/reset' && method === 'POST') {
    return stateController.resetState(req, res);
  }
  if (pathname === '/api/health' && method === 'GET') {
    return stateController.getHealth(req, res);
  }
  if (pathname === '/api/events' && method === 'GET') {
    return stateController.streamEvents(req, res);
  }

  // Order routes
  if (pathname === '/api/orders' && method === 'POST') {
    return ordersController.createOrder(req, res);
  }
  const sendMatch = pathname.match(/^\/api\/orders\/(\d+)\/send$/);
  if (sendMatch && method === 'PATCH') {
    return ordersController.sendToKitchen(req, res, Number(sendMatch[1]));
  }
  const stationMatch = pathname.match(/^\/api\/orders\/(\d+)\/station$/);
  if (stationMatch && method === 'PATCH') {
    return ordersController.markStationReady(req, res, Number(stationMatch[1]));
  }
  const serveMatch = pathname.match(/^\/api\/orders\/(\d+)\/serve$/);
  if (serveMatch && method === 'PATCH') {
    return ordersController.markServed(req, res, Number(serveMatch[1]));
  }

  // Table routes
  if (pathname === '/api/tables' && method === 'POST') {
    return tablesController.createTable(req, res);
  }
  const callMatch = pathname.match(/^\/api\/tables\/([^/]+)\/call$/);
  if (callMatch && method === 'POST') {
    return tablesController.callWaiter(req, res, callMatch[1]);
  }
  const resolveMatch = pathname.match(/^\/api\/tables\/([^/]+)\/resolve$/);
  if (resolveMatch && method === 'POST') {
    return tablesController.resolveWaiter(req, res, resolveMatch[1]);
  }
  const payMatch = pathname.match(/^\/api\/tables\/([^/]+)\/pay$/);
  if (payMatch && method === 'POST') {
    return tablesController.payBill(req, res, payMatch[1]);
  }
  const rateMatch = pathname.match(/^\/api\/tables\/([^/]+)\/rate$/);
  if (rateMatch && method === 'POST') {
    return tablesController.rateMeal(req, res, rateMatch[1]);
  }
  const clearMatch = pathname.match(/^\/api\/tables\/([^/]+)\/clear$/);
  if (clearMatch && method === 'POST') {
    return tablesController.clearTable(req, res, clearMatch[1]);
  }
  const tableManageMatch = pathname.match(/^\/api\/tables\/([^/]+)$/);
  if (tableManageMatch) {
    if (method === 'PUT') {
      return tablesController.updateTable(req, res, tableManageMatch[1]);
    }
    if (method === 'DELETE') {
      return tablesController.deleteTable(req, res, tableManageMatch[1]);
    }
  }

  // Menu routes
  if (pathname === '/api/menu' && method === 'GET') {
    return menuController.getMenu(req, res);
  }
  if (pathname === '/api/menu' && method === 'POST') {
    return menuController.createDish(req, res);
  }
  const menuToggleMatch = pathname.match(/^\/api\/menu\/([^/]+)\/toggle$/);
  if (menuToggleMatch && method === 'PATCH') {
    return menuController.toggleDish(req, res, menuToggleMatch[1]);
  }
  const menuIdMatch = pathname.match(/^\/api\/menu\/([^/]+)$/);
  if (menuIdMatch) {
    if (method === 'PUT') {
      return menuController.updateDish(req, res, menuIdMatch[1]);
    }
    if (method === 'DELETE') {
      return menuController.deleteDish(req, res, menuIdMatch[1]);
    }
  }

  // Route not found
  sendJSON(res, { error: `Endpoint ${method} ${pathname} not found` }, 404);
}
