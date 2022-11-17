/* eslint-disable max-classes-per-file */
export class GrupoNoExiste extends Error {
  name = 'Grupo No Existe';

  constructor() {
    super('El grupo no existe, comprueba que el código es correcto. Recuerda que siempre puedes crear un nuevo grupo.');
  }
}

export class SinNombreDeUsuario extends Error {
  name = 'Sin Nombre De Usuario';

  constructor() {
    super('No se ha podido encontrar su nombre de usuario. Por favor, aseguresé de que tiene un nombre de usuario.');
  }
}
export class GrupoNoConnected extends Error {
  name = 'Conexión al grupo fallida';

  constructor() {
    super('No se ha podido conectar al grupo, por favor, vuelva a intentarlo. Puede ser que el grupo sea privado.');
  }
}

export class UserErrorEditing extends Error {
  name = 'Error al guardar datos del usuario';

  constructor(data:string) {
    super(`No se ha podido guardar "${data}" en los datos del usuario`);
  }
}

export class GrupoNoPermission extends Error {
  name = 'Error al acceder a los datos del grupo.';

  constructor() {
    super('Error al acceder a los datos del grupo. Puede ser que le hayan echado del grupo.');
  }
}

export class NotEnoughQuestions extends Error {
  name = 'No suficientes preguntas';

  constructor() {
    super('No existen suficientes preguntas que cumplan los criterios establecidos');
  }
}

export class WriteDDBBError extends Error {
  name = 'Escribir Base de datos';

  constructor() {
    super('Error al escribir en la base de datos');
  }
}

export class SocketError extends Error {
  name = 'Conectar servidor';

  constructor() {
    super('Error al conectar con el servidor. Intente recargar la página.');
  }
}

export class QuestionError extends Error {
  name = 'No suficientes preguntas';

  constructor() {
    super('Error al buscar preguntas, esto se debe a que no hay suficientes preguntas que cumplan los requisitos indicados.');
  }
}
