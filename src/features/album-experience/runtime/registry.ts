export class ExperienceRegistry<T> {
  private readonly entries = new Map<string, T>();

  register(id: string, implementation: T): this {
    if (!id.trim()) throw new Error("Registry entries require an id.");
    if (this.entries.has(id)) throw new Error(`Registry entry already exists: ${id}`);
    this.entries.set(id, implementation);
    return this;
  }

  resolve(id: string): T | undefined {
    return this.entries.get(id);
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  ids(): string[] {
    return [...this.entries.keys()];
  }
}
