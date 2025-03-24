type TabChangeListener = (tab: string) => void;

const tabManager = {
    activeTab: "profile",
    listeners: new Set<TabChangeListener>(),

    setActiveTab(tab: string) {
        this.activeTab = tab;
        this.notifyListeners();
    },

    subscribe(listener: TabChangeListener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    },

    notifyListeners() {
        this.listeners.forEach((listener) => listener(this.activeTab));
    },
};

export default tabManager;
