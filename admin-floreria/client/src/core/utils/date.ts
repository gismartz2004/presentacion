interface DateConfig {
  locale: string;
  timezone: string;
  dateFormat?: "short" | "medium" | "long" | "full";
  timeFormat?: "short" | "medium" | "long" | "full";
}

class LocalDate extends Date {
  private config: DateConfig;

  constructor(time?: Date | string, config?: Partial<DateConfig>) {
    super(typeof time === "string" ? new Date(time).getTime() : time?.getTime() ?? Date.now());
    this.config = {
      locale: "es-EC", // Español de Ecuador
      timezone: "America/Guayaquil", // Ecuador por defecto
      dateFormat: "medium",
      timeFormat: "short",
      ...config,
    };
  }

  /**
   * @description Convierte una fecha a una cadena de texto en formato local con zona horaria
   * Ejemplo: 25 de dic. de 2023, 14:30
   * @param date - Fecha a formatear
   * @returns Fecha formateada según la configuración
   */
  toLocalDateString(): string {
    return new Intl.DateTimeFormat(this.config.locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.config.timezone,
    }).format(this);
  }

  /**
   * @description Convierte una fecha a formato ISO con zona horaria específica
   * @param date - Fecha a convertir
   * @returns Fecha en formato ISO con zona horaria
   */
  toLocalISODateString(): string {
    // Obtener la fecha en la zona horaria específica
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: this.config.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const parts = formatter.formatToParts(this);
    const formattedDate = `${parts[0].value}-${parts[2].value}-${parts[4].value}T${parts[6].value}:${parts[8].value}:${parts[10].value}`;

    return formattedDate;
  }

  /**
   * @description Formato solo fecha (sin hora)
   * @param date - Fecha a formatear
   * @returns Fecha formateada sin hora
   */
  toDateOnly(): string {
    return new Intl.DateTimeFormat(this.config.locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: this.config.timezone,
    }).format(this);
  }

  /**
   * @description Formato solo hora
   * @param date - Fecha a formatear
   * @returns Solo la hora formateada
   */
  toTimeOnly(): string {
    return new Intl.DateTimeFormat(this.config.locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.config.timezone,
    }).format(this);
  }

  /**
   * @description Formato relativo (hace 2 horas, ayer, etc.)
   * @param date - Fecha a comparar
   * @returns Texto relativo
   */
  toRelativeString(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();

    const formatter = new Intl.RelativeTimeFormat(this.config.locale, {
      numeric: "auto",
    });

    const diffInSeconds = (dateObj.getTime() - now.getTime()) / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (Math.abs(diffInDays) >= 1) {
      return formatter.format(Math.round(diffInDays), "day");
    } else if (Math.abs(diffInHours) >= 1) {
      return formatter.format(Math.round(diffInHours), "hour");
    } else {
      return formatter.format(Math.round(diffInMinutes), "minute");
    }
  }

  /**
   * @description Convierte UTC a la zona horaria local configurada
   * @param utcDate - Fecha en UTC
   * @returns Fecha ajustada a zona horaria local
   */
  fromUTC(utcDate: Date | string): Date {
    const dateObj = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
    return new Date(
      dateObj.toLocaleString("en-US", { timeZone: this.config.timezone })
    );
  }

  now(): Date {
    return new Date();
  }

  /**
   * @description Convierte fecha local a UTC
   * @param localDate - Fecha local
   * @returns Fecha en UTC
   */
  toUTC(localDate: Date | string): Date {
    const dateObj =
      typeof localDate === "string" ? new Date(localDate) : localDate;
    return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
  }

  /**
   * @description Cambia la configuración de zona horaria
   * @param timezone - Nueva zona horaria
   */
  setTimezone(timezone: string): void {
    this.config.timezone = timezone;
  }

  /**
   * @description Cambia la configuración de idioma
   * @param locale - Nuevo idioma
   */
  setLocale(locale: string): void {
    this.config.locale = locale;
  }

  /**
   * @description Obtiene la configuración actual
   * @returns Configuración de fecha actual
   */
  getConfig(): DateConfig {
    return { ...this.config };
  }

  // Métodos estáticos para compatibilidad con código existente
  static toLocalDateString(date: Date): string {
    const instance = new LocalDate(date);
    return instance.toLocalDateString();
  }

  static toLocalISODateString(date: Date): string {
    const instance = new LocalDate(date);
    return instance.toLocalISODateString();
  }
}

export { LocalDate };
