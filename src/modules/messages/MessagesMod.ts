import type { Fetcher } from "../../Fetcher.js";
import type { Message, MessageContentOptions, MessageFile, MessageFolder, MessagePerson, MessagesList, MessagesListOptions, SDate, SDateAndHour } from "../../types.js";
import { bdecode } from "../../utils/base64.js";
import type { MessagesRoot, MessageRoot } from "./MessagesRoot.js";

export class MessagesMod {
  static async getMessagesList(
    fetcher: Fetcher,
    options: MessagesListOptions = {
      folder: "received",
      page: 0,
    }
  ): Promise<MessagesList> {
    let data = await fetcher.request<MessagesRoot>(
      { anneeMessages: "2025-2026" },
      `messages.awp?force=false&typeRecuperation=${options.folder}&idClasseur=0&orderBy=date&order=desc&query=&onlyRead=&page=${options.page}&itemsPerPage=100&getAll=0`,
      "messages list",
      "eleves"
    );
    return MessagesMod.cleanMessagesList(data);
  }

  static async getMessageContent(fetcher: Fetcher, options: MessageContentOptions): Promise<Message> {
    let data = await fetcher.request<MessageRoot>({ anneeMessages: "2025-2026" }, `messages/${options.id}.awp?mode=destinataire`, "message content", "eleves");
    return MessagesMod.cleanMessage(data);
  }

  static cleanMessage(data: MessageRoot): Message {
    return {
      answered: data.answered,
      canAnwser: data.canAnswer,
      date: data.date as SDateAndHour,
      draft: data.brouillon,
      files: data.files.map<MessageFile>((f) => ({
        id: f.id,
        name: f.libelle,
        date: data.date as SDate,
      })),
      from: {
        firstName: data.from.prenom,
        name: data.from.nom,
        prefix: data.from.civilite,
      },
      to: data.to.map<MessagePerson>((t) => ({
        firstName: t.prenom,
        name: t.nom,
        prefix: t.civilite,
      })),
      id: data.id,
      read: data.read,
      subject: data.subject,
      transferred: data.transferred,
      content: bdecode(data.content),
    };
  }

  static cleanMessagesList(data: MessagesRoot): MessagesList {
    const folder = (Object.keys(data.messages) as MessageFolder[]).find((k) => data.messages[k].length > 0);
    if (!folder) {
      return {
        messages: [],
      };
    }

    return {
      messages: data.messages[folder].map<Message>((m) => MessagesMod.cleanMessage(m)),
    };
  }
}
