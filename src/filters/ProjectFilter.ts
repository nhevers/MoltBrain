/**
 * Project Filter
 * 
 * Filter observations by project.
 */

export class ProjectFilter {
  private selectedProjects: Set<string> = new Set();
  private excludedProjects: Set<string> = new Set();

  /**
   * Select a project
   */
  select(project: string): void {
    this.selectedProjects.add(project);
    this.excludedProjects.delete(project);
  }

  /**
   * Select multiple projects
   */
  selectMultiple(projects: string[]): void {
    for (const project of projects) {
      this.select(project);
    }
  }

  /**
   * Deselect a project
   */
  deselect(project: string): void {
    this.selectedProjects.delete(project);
  }

  /**
   * Exclude a project
   */
  exclude(project: string): void {
    this.excludedProjects.add(project);
    this.selectedProjects.delete(project);
  }

  /**
   * Toggle a project
   */
  toggle(project: string): boolean {
    if (this.selectedProjects.has(project)) {
      this.deselect(project);
      return false;
    } else {
      this.select(project);
      return true;
    }
  }

  /**
   * Check if a project is selected
   */
  isSelected(project: string): boolean {
    return this.selectedProjects.has(project);
  }

  /**
   * Check if a project is excluded
   */
  isExcluded(project: string): boolean {
    return this.excludedProjects.has(project);
  }

  /**
   * Get selected projects
   */
  getSelected(): string[] {
    return Array.from(this.selectedProjects);
  }

  /**
   * Get excluded projects
   */
  getExcluded(): string[] {
    return Array.from(this.excludedProjects);
  }

  /**
   * Clear filter
   */
  clear(): void {
    this.selectedProjects.clear();
    this.excludedProjects.clear();
  }

  /**
   * Check if a project matches the filter
   */
  matches(project: string): boolean {
    // If excluded, always false
    if (this.excludedProjects.has(project)) {
      return false;
    }

    // If no selection, match all (except excluded)
    if (this.selectedProjects.size === 0) {
      return true;
    }

    // Otherwise, must be in selection
    return this.selectedProjects.has(project);
  }

  /**
   * Filter an array of items
   */
  filter<T>(items: T[], getProject: (item: T) => string): T[] {
    return items.filter(item => this.matches(getProject(item)));
  }

  /**
   * Check if filter is active
   */
  isActive(): boolean {
    return this.selectedProjects.size > 0 || this.excludedProjects.size > 0;
  }

  /**
   * Get description
   */
  getDescription(): string {
    if (!this.isActive()) return 'All projects';

    if (this.selectedProjects.size > 0) {
      const projects = this.getSelected();
      if (projects.length === 1) {
        return projects[0];
      }
      return `${projects.length} projects`;
    }

    if (this.excludedProjects.size > 0) {
      return `Excluding ${this.excludedProjects.size} projects`;
    }

    return 'All projects';
  }

  /**
   * Select only one project
   */
  selectOnly(project: string): void {
    this.clear();
    this.select(project);
  }

  /**
   * Search projects by name
   */
  static searchProjects(projects: string[], query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return projects.filter(p => p.toLowerCase().includes(lowerQuery));
  }
}
