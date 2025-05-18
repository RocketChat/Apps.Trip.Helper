import { ICommandUtilityParams } from "../command/ICommandUtility";

export interface IHandler extends Omit<ICommandUtilityParams, "params"> {
    Help(): Promise<void>;
}

export type IHanderParams = Omit<ICommandUtilityParams, "params">;
