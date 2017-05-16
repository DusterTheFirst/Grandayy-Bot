using System;
using System.Collections.Generic;
using System.Text;
using SixLabors.Fonts;

namespace RobbieBotten.Util {
    public class Card {
        public FontCollection collection;
        public Font Helvitica;

        public Card() {
            collection = new FontCollection();
            Helvitica = collection.Install(@"Fonts\Helvetica.ttf");
        }

        public void Compile() {

        }

    }
}
