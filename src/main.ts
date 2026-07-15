import './style.css';
import { ScreenManager } from './ui/screenManager';
import { titleScreen } from './screens/title';

const app = document.getElementById('app')!;
const manager = new ScreenManager(app);
manager.replace(titleScreen(manager));
