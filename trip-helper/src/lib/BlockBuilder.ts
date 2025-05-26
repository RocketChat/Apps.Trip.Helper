import {
    ActionsBlock,
    ContextBlock,
    InputBlock,
    LayoutBlockType,
    PreviewBlockBase,
    PreviewBlockWithThumb,
    SectionBlock,
    TextObject,
    TextObjectType,
} from "@rocket.chat/ui-kit";
import { PreviewBlockParam } from "../definition/ui-kit/Block/IPreviewBlock";
import { ContextBlockParam } from "../definition/ui-kit/Block/IContextBlock";
import { InputBlockParam } from "../definition/ui-kit/Block/IInputBlock";
import { SectionBlockParam } from "../definition/ui-kit/Block/ISectionBlock";
import { ActionBlockParam } from "../definition/ui-kit/Block/IActionBlock";

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

    public createSectionBlock(param: SectionBlockParam): SectionBlock {
        const { text, blockId, fields, accessory } = param;
        const sectionBlock: SectionBlock = {
            appId: this.appId,
            blockId,
            type: LayoutBlockType.SECTION,
            text: {
                type: TextObjectType.MRKDWN,
                text: text ? text : "",
            },
            accessory,
            fields: fields ? this.createTextObjects(fields) : undefined,
        };
        return sectionBlock;
    }

    public createActionBlock(param: ActionBlockParam): ActionsBlock {
        const { elements } = param;
        const actionBlock: ActionsBlock = {
            type: LayoutBlockType.ACTIONS,
            elements: elements,
        };
        return actionBlock;
    }
}
