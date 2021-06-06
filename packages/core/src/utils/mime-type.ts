function checkMimeTypes(type: string) {
  const extname = type.replace(/\./, '').toLowerCase();
  const images = ['jpg', 'jpeg', 'png'];
  const html = ['html', 'htm'];
  const js = ['js'];

  switch (true) {
    case (images.indexOf(extname) > -1): {
      return 'image/*';
    }
    case (html.indexOf(extname) > -1): {
      return 'text/html';
    }
    case (js.indexOf(extname) > -1): {
      return 'application/javascript';
    }
    default: {
      return 'text/plain';
    }
  }
}

export {
  checkMimeTypes
}