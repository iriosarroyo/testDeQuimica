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
    super('No se ha podido conectar al grupo, por favor, vuelva a intentarlo.');
  }
}

export class UserErrorEditing extends Error {
  name = 'Error al guardar datos del usuario';

  constructor(data:string) {
    super(`No se ha podido guardar "${data}" en los datos del usuario`);
  }
}
