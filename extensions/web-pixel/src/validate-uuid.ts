class EventUUIDValidationError extends Error {
  constructor(message: string) {
      super(message);
      this.name ="EventUUIDValidationError";
  }
}

function isValidUUID(uuid: string | undefined): uuid is string {
  
  const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
}

function validateEventUUID(uuid: string){
  
  if(!isValidUUID(uuid)){
    throw new EventUUIDValidationError(`Invalid event UUID: ${uuid}`);
  }
  return true;
}

export function extractEventUUID(eventId: string | undefined){
  if (!eventId) return undefined

  try {
    if (validateEventUUID(eventId)) {
      return eventId
    }
  }catch (error) {
    if (error instanceof EventUUIDValidationError) {
        console.warn(error.message)
    }
  }
  const newUuid = eventId.substring(eventId.indexOf('-') + 1 ) as string;
  
  try {
    if (validateEventUUID(newUuid)) {
      return newUuid;
    }
  } catch (error) {
    if (error instanceof EventUUIDValidationError) {
      console.warn(error.message)
    }
  }

  return undefined;
}