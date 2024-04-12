import IBMi from "../api/IBMi";
import { GetNewLibl } from "./getNewLibl";
import { IfsWrite } from "./ifsWrite";
import { SqlToCsv } from "./sqlToCsv";

export enum ComponentState {
  NotChecked = `NotChecked`,
  NotInstalled = `NotInstalled`,
  Installed = `Installed`,
  Error = `Error`,
}
interface ComponentRegistry {
  GetNewLibl?: GetNewLibl;
  SqlToCsv?: SqlToCsv;
  IfsWrite?: IfsWrite;
}

export type ComponentId = keyof ComponentRegistry;

export abstract class ComponentT {
  public state: ComponentState = ComponentState.NotChecked;
  public currentVersion: number = 0;

  constructor(public connection: IBMi) { }

  abstract getInstalledVersion(): Promise<number | undefined>;
  abstract checkState(): Promise<boolean>
  abstract getState(): ComponentState;
}

export class ComponentManager {
  private registered: ComponentRegistry = {};

  public async startup(connection: IBMi) {
    this.registered.GetNewLibl = new GetNewLibl(connection);
    await this.registered.GetNewLibl.checkState();

    this.registered.IfsWrite = new IfsWrite(connection);
    await this.registered.IfsWrite.checkState();

    this.registered.SqlToCsv = new SqlToCsv(connection);
    await this.registered.SqlToCsv.checkState();
  }

  // TODO: return type based on ComponentIds
  get<T>(id: ComponentId): T|undefined {
    const component = this.registered[id];
    if (component && component.getState() === ComponentState.Installed) {
      return component as T;
    }
  }
}