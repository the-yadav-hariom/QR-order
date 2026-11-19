import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import { createInitialSeed, DEFAULT_MENU } from '../config/defaultData.js';
import { eventService } from '../services/eventService.js';

class Database {
  constructor() {
    this.filePath = config.dataFile;
    this.state = null;
    this.saveTimeout = null;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.state = JSON.parse(raw);
        if (!this.state.menu || !this.state.menu.length) {
          this.state.menu = JSON.parse(JSON.stringify(DEFAULT_MENU));
        }
        console.log(`[Database] Loaded persistent state from ${this.filePath}`);
      } else {
        this.state = createInitialSeed();
        this.saveSync();
        console.log(`[Database] Initialized new persistent state at ${this.filePath}`);
      }
    } catch (err) {
      console.warn(`[Database] Error loading state from disk, using fresh seed:`, err.message);
      this.state = createInitialSeed();
    }
  }

  getState() {
    return this.state;
  }

  saveSync() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[Database] Failed to write state:`, err.message);
    }
  }

  scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveSync();
    }, 200);
  }

  commit(updater, notifyEvent = null) {
    updater(this.state);
    this.state.rev = (this.state.rev || 0) + 1;
    this.scheduleSave();

    // Broadcast state & notifications in real-time
    eventService.broadcast('state', this.state);
    if (notifyEvent) {
      eventService.broadcast('notify', notifyEvent);
    }
    return this.state;
  }

  reset() {
    const currentSpeed = this.state.speed || 1;
    const currentMenu = this.state.menu || DEFAULT_MENU;
    const newSeed = createInitialSeed();

    this.state = {
      ...newSeed,
      speed: currentSpeed,
      menu: currentMenu,
      rev: (this.state.rev || 0) + 1,
    };

    this.saveSync();
    eventService.broadcast('state', this.state);
    eventService.broadcast('notify', {
      t: 'sent',
      aud: ['guest', 'staff', 'kitchen'],
      msg: { all: 'Demo state has been reset to starting seed' },
    });
    return this.state;
  }
}

export const db = new Database();
