using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Config {
    public class ConfigManager {

        private ConfigFile Config;

        public event EventHandler<ConfigFile> OnLoad;
        public event EventHandler<ConfigFile> OnSave;
        public event EventHandler<string> OnFileNotFound;

        public ConfigFile Load() => Load("config.json");
        public ConfigFile Load(string path) {
            LoadConfig(path);
            OnLoad?.BeginInvoke(this, Config, null, null);
            return Config;
        }
        private void LoadConfig(string path) {
            if (!File.Exists(path)) {
                string file = JsonConvert.SerializeObject(new ConfigFile(), Formatting.Indented);
                File.WriteAllText(path, file);
                OnFileNotFound?.Invoke(this, path);
            }
            Config = JsonConvert.DeserializeObject<ConfigFile>(File.ReadAllText(path)) ?? new ConfigFile();
        }

        public ConfigFile Save() => Save("config.json");
        public ConfigFile Save(string path) {
            OnSave?.Invoke(this, Config);
            SaveConfig(path);
            return Config;
        }
        private void SaveConfig(string path) {
            string file = JsonConvert.SerializeObject(Config, Formatting.Indented);
            File.WriteAllText(path, file);
        }

    }
}
