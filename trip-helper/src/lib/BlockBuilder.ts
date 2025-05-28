import {
    ContextBlock,
    InputBlock,
    LayoutBlockType,
    PreviewBlockBase,
    PreviewBlockWithThumb,
    TextObject,
    TextObjectType,
} from "@rocket.chat/ui-kit";
import { PreviewBlockParam } from "../definition/ui-kit/Block/IPreviewBlock";
import { ContextBlockParam } from "../definition/ui-kit/Block/IContextBlock";
import { InputBlockParam } from "../definition/ui-kit/Block/IInputBlock";

export class BlockBuilder {
    constructor(private readonly appId: string) {}

    private createTextObjects(fields: Array<string>): Array<TextObject> {
        return fields.map((field) => {
            return {
                type: TextObjectType.MRKDWN,
                text: field,
            };
        });
    }

    public createPreviewBlock(
        param: PreviewBlockParam
    ): PreviewBlockBase | PreviewBlockWithThumb {
        const { title, description, footer, thumb } = param;
        const previewBlock: PreviewBlockBase | PreviewBlockWithThumb = {
            type: LayoutBlockType.PREVIEW,
            title: this.createTextObjects(title),
            description: this.createTextObjects(description),
            footer,
            thumb,
        };
        return previewBlock;
    }

    public createInputBlock(param: InputBlockParam): InputBlock {
        const { text, element, blockId, hint, optional } = param;

        const inputBlock: InputBlock = {
            type: LayoutBlockType.INPUT,
            label: {
                type: TextObjectType.PLAIN_TEXT,
                text,
            },
            appId: this.appId,
            element,
            hint,
            optional,
            blockId,
        };

        return inputBlock;
    }

    public createContextBlock(param: ContextBlockParam): ContextBlock {
        const { contextElements, blockId } = param;

        const elements = contextElements.map((element) => {
            if (typeof element === "string") {
                return {
                    type: TextObjectType.MRKDWN,
                    text: element,
                } as TextObject;
            } else {
                return element;
            }
        });

        const contextBlock: ContextBlock = {
            type: LayoutBlockType.CONTEXT,
            elements,
            blockId,
        };

        return contextBlock;
    }
}
